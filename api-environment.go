package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandleEnvironment(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		p.Env.Lock()
		result := *p.Env.Data
		p.Env.Unlock()

		res.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(res).Encode(result)
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}
