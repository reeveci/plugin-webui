package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandleWorkerGroups(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		result := WorkerGroupsResponse{
			WorkerGroups: p.History.Groups(),
		}

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
