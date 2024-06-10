package main

import (
	"github.com/hashicorp/go-hclog"
	"github.com/reeveci/reeve-lib/plugin"
	"github.com/reeveci/reeve-lib/schema"
)

const PLUGIN_NAME = "webui"

func main() {
	log := hclog.New(&hclog.LoggerOptions{})

	plugin.Serve(&plugin.PluginConfig{
		Plugin: &WebUIPlugin{
			Log: log,

			JWTSecret: GenerateTokenSecret(),
			History:   NewPipelineHistory(10),
			Actions:   NewActionStore(),
			Env:       NewEnvStore(),
		},

		Logger: log,
	})
}

type WebUIPlugin struct {
	HTTPPort, HTTPSPort          string
	TLSCert, TLSKey              string
	AdminUsername, AdminPassword string
	CORSOrigin                   string

	Log hclog.Logger
	API plugin.ReeveAPI

	JWTSecret string
	History   *PipelineHistory
	Actions   *ActionStore
	Env       *EnvStore
}

func (p *WebUIPlugin) Name() (string, error) {
	return PLUGIN_NAME, nil
}

func (p *WebUIPlugin) Register(settings map[string]string, api plugin.ReeveAPI) (capabilities plugin.Capabilities, err error) {
	p.API = api

	var enabled bool
	if enabled, err = boolSetting(settings, "ENABLED"); !enabled || err != nil {
		return
	}
	p.HTTPPort = settings["HTTP_PORT"]
	p.HTTPSPort = settings["HTTPS_PORT"]
	p.TLSCert = settings["TLS_CERT_FILE"]
	p.TLSKey = settings["TLS_KEY_FILE"]
	if p.AdminUsername, err = requireSetting(settings, "ADMIN_USERNAME"); err != nil {
		return
	}
	if p.AdminPassword, err = requireSetting(settings, "ADMIN_PASSWORD"); err != nil {
		return
	}
	p.CORSOrigin = settings["CORS_ORIGIN"]

	if p.HTTPPort == "" && (p.HTTPSPort == "" || p.TLSCert == "" || p.TLSKey == "") {
		p.HTTPPort = "9180"
	}

	go Serve(p)

	p.API.NotifyMessages([]schema.Message{schema.BroadcastMessage(map[string]string{"webui": "present"}, nil)})

	capabilities.Message = true
	capabilities.Notify = true
	return
}

func (p *WebUIPlugin) Unregister() error {
	p.API.Close()

	return nil
}

func (p *WebUIPlugin) Discover(trigger schema.Trigger) ([]schema.Pipeline, error) {
	return nil, nil
}

func (p *WebUIPlugin) Resolve(env []string) (map[string]schema.Env, error) {
	return nil, nil
}

func (p *WebUIPlugin) CLIMethod(method string, args []string) (string, error) {
	return "", nil
}
