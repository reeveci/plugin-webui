package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandlePipelines(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		groups := p.History.Groups()

		result := PipelinesResponse{
			WorkerGroups: make(map[string]WorkerGroupResponse, len(groups)),
		}

		for _, workerGroup := range groups {
			if summary := p.History.Summary(workerGroup); len(summary.Pipelines) > 0 {
				result.WorkerGroups[workerGroup] = summary
			}
		}

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
