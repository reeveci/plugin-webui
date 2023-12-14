package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandleActions(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		p.Actions.Lock()
		result := *p.Actions.Data
		p.Actions.Unlock()

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
