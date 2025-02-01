package main

import (
	"io"
	"sort"
	"sync"
	"time"

	"github.com/djherbis/stream"
	"github.com/reeveci/reeve-lib/schema"
	"github.com/reeveci/reeve-lib/streams"
)

func NewPipelineHistory(size int) *PipelineHistory {
	return &PipelineHistory{
		entries: make([]*HistoryEntry, 0, size+1),
		size:    size,
	}
}

type PipelineHistory struct {
	entries []*HistoryEntry
	size    int

	sync.Mutex
}

type HistoryEntry struct {
	schema.PipelineStatus

	StartTime, EndTime *time.Time
	Logs               schema.LogReaderProvider
}

func (p *PipelineHistory) Put(status schema.PipelineStatus) *HistoryEntry {
	p.Lock()
	defer p.Unlock()

	var entry *HistoryEntry
	for _, value := range p.entries {
		if value.ActivityID == status.ActivityID {
			entry = value
			entry.PipelineStatus = status
			break
		}
	}

	if entry == nil {
		now := time.Now()
		entry = &HistoryEntry{
			PipelineStatus: status,
			StartTime:      &now,
			Logs:           nil,
		}

		p.entries = append(p.entries, entry)
	}

	entry.PipelineStatus.Logs = nil

	if entry.Logs != nil || !status.Logs.Available() {
		status.Logs.Close()
	} else {
		reader, err := status.Logs.Reader()
		if err != nil {
			status.Logs.Close()
		} else {
			stream := stream.NewMemStream()
			entry.Logs = streams.NewStreamProvider(stream)

			go func() {
				io.Copy(stream, reader)
				entry.Logs.Close()
				reader.Close()
				status.Logs.Close()
			}()
		}
	}

	if status.Finished() {
		now := time.Now()
		entry.EndTime = &now
		p.cleanup()
	}

	return entry
}

func (p *PipelineHistory) Get(activityID string) (result HistoryEntry, ok bool) {
	p.Lock()
	defer p.Unlock()

	for _, value := range p.entries {
		if value.ActivityID == activityID {
			return *value, true
		}
	}

	return
}

func (p *PipelineHistory) Groups() []string {
	p.Lock()
	defer p.Unlock()

	names := make(map[string]bool)
	for _, entry := range p.entries {
		names[entry.WorkerGroup] = true
	}

	result := make([]string, 0, len(names))
	for key := range names {
		result = append(result, key)
	}
	sort.Strings(result)

	return result
}

func (p *PipelineHistory) Entries(workerGroups []string) []HistoryEntry {
	p.Lock()
	defer p.Unlock()

	count := len(p.entries)

	groups := make(map[string]bool, len(workerGroups))
	for _, key := range workerGroups {
		groups[key] = true
	}
	filterGroups := len(workerGroups) > 0

	result := make([]HistoryEntry, 0, count)

	for _, entry := range p.entries {
		if !filterGroups || groups[entry.WorkerGroup] {
			result = append(result, *entry)
		}
	}

	return result
}

func (p *PipelineHistory) cleanup() {
	count := len(p.entries)

	filtered := make([]*HistoryEntry, 0, count)
	free := p.size

	for i := range p.entries {
		value := p.entries[count-1-i]

		if !value.Finished() {
			filtered = append(filtered, value)
		} else if free > 0 {
			free -= 1
			filtered = append(filtered, value)
		}
	}

	remaining := len(filtered)
	if remaining == count {
		return
	}

	result := make([]*HistoryEntry, remaining)
	for i, value := range filtered {
		result[remaining-1-i] = value
	}
	p.entries = result
}
