package main

import (
	"encoding/json"
	"fmt"

	"github.com/reeveci/reeve-lib/schema"
)

func (p *WebUIPlugin) Message(source string, message schema.Message) error {
	switch message.Options["webui"] {
	case "actions":
		if !schema.IsMessageFromPlugin(source) {
			return nil
		}

		var actions ActionBundle
		err := json.Unmarshal(message.Data, &actions)
		if err != nil {
			return fmt.Errorf("invalid actions message - error parsing actions - %s", err)
		}

		err = p.Actions.Register(source, actions)
		if err != nil {
			return fmt.Errorf("error registering actions - %s", err)
		}
	}

	return nil
}
