package main

import (
	"time"

	"github.com/reeveci/reeve-lib/schema"
)

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Username    string    `json:"username"`
	AccessToken string    `json:"accessToken"`
	Expires     time.Time `json:"expires"`
}

type WorkerGroupsResponse struct {
	WorkerGroups []string `json:"workerGroups"`
}

type PipelinesResponse struct {
	Pipelines []PipelineSummaryResponse `json:"pipelines"`
}

type PipelineSummaryResponse struct {
	ID          string                `json:"id"`
	WorkerGroup string                `json:"workerGroup"`
	Name        string                `json:"name"`
	Headline    string                `json:"headline"`
	StartTime   *time.Time            `json:"startTime"`
	EndTime     *time.Time            `json:"endTime"`
	Status      schema.Status         `json:"status"`
	Result      schema.PipelineResult `json:"result"`
}

func (r *PipelineSummaryResponse) ApplyHistoryEntry(entry *HistoryEntry) {
	r.ID = entry.ActivityID
	r.WorkerGroup = entry.WorkerGroup
	r.Name = entry.Pipeline.Name
	r.Headline = entry.Pipeline.Headline
	r.StartTime = entry.StartTime
	r.EndTime = entry.EndTime
	r.Status = entry.Status
	r.Result = entry.Result
}

type PipelineDetailResponse struct {
	PipelineSummaryResponse
	Pipeline schema.Pipeline `json:"pipeline"`
}

func (r *PipelineDetailResponse) ApplyHistoryEntry(entry *HistoryEntry) {
	r.PipelineSummaryResponse.ApplyHistoryEntry(entry)
	r.Pipeline = entry.Pipeline
}
