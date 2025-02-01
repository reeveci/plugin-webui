package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandlePipelines(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		groups := req.URL.Query()["workerGroup"]

		pipelines := p.History.Entries(groups)
    count := len(pipelines)

		result := PipelinesResponse{
			Pipelines: make([]PipelineSummaryResponse, count),
		}

		for i, entry := range pipelines {
			result.Pipelines[count-1-i].ApplyHistoryEntry(&entry)
		}

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
