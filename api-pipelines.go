package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandlePipelines(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		groups := req.URL.Query()["workerGroup"]

		pipelines := p.History.Summary(groups)

		result := PipelinesResponse{
			Pipelines: make([]PipelineSummaryResponse, len(pipelines)),
		}

		for i, entry := range pipelines {
			result.Pipelines[i].ApplyHistoryEntry(&entry)
		}

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
