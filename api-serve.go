package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"

	"github.com/gorilla/mux"
)

const API_PREFIX = "/api"
const API_VERSION = "v1"
const API_PATH = API_PREFIX + "/" + API_VERSION

const clientPath = "client/dist"

//go:embed all:client/dist
var clientSource embed.FS

func Serve(p *WebUIPlugin) {
	// API

	api := mux.NewRouter()
	api.HandleFunc("/auth", CorsHandler(p, HandleAuth(p), http.MethodPost))
	api.HandleFunc("/pipelines", CorsHandler(p, AuthValidator(p, HandlePipelines(p)), http.MethodGet))
	api.HandleFunc("/pipelines/{workerGroup}", CorsHandler(p, AuthValidator(p, HandleWorkerGroup(p)), http.MethodGet))
	api.HandleFunc("/pipelines/{workerGroup}/{id}", CorsHandler(p, AuthValidator(p, HandlePipeline(p)), http.MethodGet))
	api.HandleFunc("/pipelines/{workerGroup}/{id}/logs", CorsHandler(p, AuthValidator(p, HandlePipelineLogs(p)), http.MethodGet))
	api.HandleFunc("/actions", CorsHandler(p, AuthValidator(p, HandleActions(p)), http.MethodGet))
	api.HandleFunc("/actions/{id}", CorsHandler(p, AuthValidator(p, HandleTriggerAction(p)), http.MethodPost))
	api.HandleFunc("/environment", CorsHandler(p, AuthValidator(p, HandleEnvironment(p)), http.MethodGet))
	api.HandleFunc("/prompts/{id}", CorsHandler(p, AuthValidator(p, HandleTriggerPrompt(p)), http.MethodPost))

	http.HandleFunc(API_PATH+"/", OmitTrailingSlash(http.StripPrefix(API_PATH, api)))
	http.HandleFunc(API_PREFIX+"/", func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
	})

	// Client

	clientFS, err := fs.Sub(clientSource, clientPath)
	if err != nil {
		panic(err)
	}

	http.Handle("/", BasicAuthProvider(p, http.FileServer(FileRewrite(http.FS(clientFS), "index.html"))))

	// Serve

	hasHTTP := p.HTTPPort != ""
	hasHTTPS := p.HTTPSPort != "" && p.TLSCert != "" && p.TLSKey != ""

	if !hasHTTP {
		ServeHTTPS(p)
		return
	}

	if hasHTTPS {
		go ServeHTTPS(p)
	}
	ServeHTTP(p)
}

func ServeHTTPS(p *WebUIPlugin) {
	p.Log.Info(fmt.Sprintf("listening at https://localhost:%s\n", p.HTTPSPort))
	err := http.ListenAndServeTLS(fmt.Sprintf(":%s", p.HTTPSPort), p.TLSCert, p.TLSKey, nil)
	p.Log.Info(fmt.Sprintf("HTTPS server exited - %s\n", err))
}

func ServeHTTP(p *WebUIPlugin) {
	p.Log.Info(fmt.Sprintf("listening at http://localhost:%s\n", p.HTTPPort))
	err := http.ListenAndServe(fmt.Sprintf(":%s", p.HTTPPort), nil)
	p.Log.Info(fmt.Sprintf("HTTP server exited - %s\n", err))
}
