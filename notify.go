package main

import (
	"github.com/reeveci/reeve-lib/schema"
)

func (p *WebUIPlugin) Notify(status schema.PipelineStatus) error {
	p.History.Put(status)

	return nil
}
