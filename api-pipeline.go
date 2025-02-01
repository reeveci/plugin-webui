package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func HandlePipeline(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		vars := mux.Vars(req)

		id := vars["id"]
		if id == "" {
			http.Error(res, "missing id path parameter", http.StatusBadRequest)
			return
		}

		entry, ok := p.History.Get(id)
		if !ok {
			http.Error(res, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		var result PipelineDetailResponse
    result.ApplyHistoryEntry(&entry)

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
