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

type PipelinesResponse struct {
	WorkerGroups map[string]WorkerGroupResponse `json:"workerGroups"`
}

type WorkerGroupResponse struct {
	Pipelines []PipelineSummaryResponse `json:"pipelines"`
}

type PipelineSummaryResponse struct {
	ID        string                `json:"id"`
	Name      string                `json:"name"`
	StartTime time.Time             `json:"startTime"`
	Status    schema.Status         `json:"status"`
	Result    schema.PipelineResult `json:"result"`
}

type PipelineDetailResponse struct {
	PipelineSummaryResponse
	Pipeline schema.Pipeline `json:"pipeline"`
}
