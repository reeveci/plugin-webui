package main

import (
	"io"
	"sync"
	"time"

	"github.com/djherbis/stream"
	"github.com/reeveci/reeve-lib/schema"
	"github.com/reeveci/reeve-lib/streams"
)

func NewPipelineHistory(size int) *PipelineHistory {
	return &PipelineHistory{
		Entries: make(map[string][]*HistoryEntry),
		size:    size,
	}
}

type PipelineHistory struct {
	Entries map[string][]*HistoryEntry
	size    int

	sync.Mutex
}

type HistoryEntry struct {
	schema.PipelineStatus

	StartTime time.Time
	Logs      schema.LogReaderProvider
}

func (p *PipelineHistory) Put(status schema.PipelineStatus) *HistoryEntry {
	p.Lock()
	defer p.Unlock()

	group := p.Entries[status.WorkerGroup]

	var entry *HistoryEntry
	for _, value := range group {
		if value.ActivityID == status.ActivityID {
			entry = value
			entry.PipelineStatus = status
			break
		}
	}

	if entry == nil {
		entry = &HistoryEntry{
			PipelineStatus: status,
			StartTime:      time.Now(),
			Logs:           nil,
		}

		p.Entries[status.WorkerGroup] = append(group, entry)
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
		p.cleanup(status.WorkerGroup)
	}

	return entry
}

func (p *PipelineHistory) Get(workerGroup, activityID string) (result HistoryEntry, ok bool) {
	p.Lock()
	defer p.Unlock()

	group := p.Entries[workerGroup]

	for _, value := range group {
		if value.ActivityID == activityID {
			return *value, true
		}
	}

	return
}

func (p *PipelineHistory) Groups() []string {
	p.Lock()
	defer p.Unlock()

	result := make([]string, 0, len(p.Entries))

	for key := range p.Entries {
		result = append(result, key)
	}

	return result
}

func (p *PipelineHistory) Summary(workerGroup string) WorkerGroupResponse {
	p.Lock()
	defer p.Unlock()

	group := p.Entries[workerGroup]
	count := len(group)

	result := WorkerGroupResponse{
		Pipelines: make([]PipelineSummaryResponse, count),
	}

	for i, entry := range group {
		result.Pipelines[count-1-i] = PipelineSummaryResponse{
			ID:        entry.ActivityID,
			Name:      entry.Pipeline.Name,
			StartTime: entry.StartTime,
			Status:    entry.Status,
			Result:    entry.Result,
		}
	}

	return result
}

func (p *PipelineHistory) cleanup(workerGroup string) {
	group := p.Entries[workerGroup]
	count := len(group)

	filtered := make([]*HistoryEntry, 0, count)
	free := p.size

	for i := range group {
		value := group[count-1-i]

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
	p.Entries[workerGroup] = result
}
