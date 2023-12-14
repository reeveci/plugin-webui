package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/reeveci/reeve-lib/schema"
)

func HandleTriggerAction(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		vars := mux.Vars(req)

		id := vars["id"]
		if id == "" {
			http.Error(res, "missing action ID path parameter", http.StatusBadRequest)
			return
		}

		p.Actions.Lock()
		action, ok := p.Actions.Actions[id]
		var message schema.Message
		if ok {
			message = action.Message
		}
		p.Actions.Unlock()

		if !ok {
			http.Error(res, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		err := p.API.NotifyMessages([]schema.Message{message})
		if err != nil {
			http.Error(res, "sending action message failed", http.StatusInternalServerError)
			return
		}

		res.WriteHeader(http.StatusAccepted)
	}
}
