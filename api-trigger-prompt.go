package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/reeveci/reeve-lib/schema"
)

type PromptRequest struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func HandleTriggerPrompt(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		vars := mux.Vars(req)

		id := vars["id"]
		if id == "" {
			http.Error(res, "missing prompt ID path parameter", http.StatusBadRequest)
			return
		}

		p.Env.Lock()
		prompt, ok := p.Env.Prompts[id]
		var message schema.Message
		var nameOption string
		var valueOption string
		if ok {
			message = prompt.Message
			nameOption = prompt.NameOption
			valueOption = prompt.ValueOption
		}
		p.Env.Unlock()
		if !ok {
			http.Error(res, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		if nameOption == "" {
			nameOption = "name"
		}
		if valueOption == "" {
			valueOption = "value"
		}

		if req.Header.Get("Content-type") != "application/json" {
			http.Error(res, "Content-Type header is not application/json", http.StatusUnsupportedMediaType)
			return
		}

		var request PromptRequest

		decoder := json.NewDecoder(req.Body)
		decoder.DisallowUnknownFields()
		err := decoder.Decode(&request)
		if err != nil {
			http.Error(res, fmt.Sprintf("invalid request body - %s", err), http.StatusBadRequest)
			return
		}

		if request.Name == "" {
			http.Error(res, "missing name", http.StatusBadRequest)
			return
		}

		options := make(map[string]string, len(message.Options)+2)
		for key, value := range message.Options {
			options[key] = value
		}
		options[nameOption] = request.Name
		options[valueOption] = request.Value
		message.Options = options

		err = p.API.NotifyMessages([]schema.Message{message})
		if err != nil {
			http.Error(res, "sending prompt message failed", http.StatusInternalServerError)
			return
		}

		res.WriteHeader(http.StatusAccepted)
	}
}
