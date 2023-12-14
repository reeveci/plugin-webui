package main

import (
	"net/http"
	"strings"
)

func CorsHandler(p *WebUIPlugin, handler http.Handler, methods ...string) http.HandlerFunc {
	var hasOptions bool
	for _, method := range methods {
		if method == http.MethodOptions {
			hasOptions = true
			break
		}
	}
	if !hasOptions {
		methods = append(methods, http.MethodOptions)
	}

	return func(res http.ResponseWriter, req *http.Request) {
		headers := res.Header()

		if p.CORSOrigin != "" {
			headers.Set("Access-Control-Allow-Origin", p.CORSOrigin)
		}
		headers.Set("Access-Control-Allow-Credentials", "true")

		if req.Method == http.MethodOptions {
			headers.Add("Access-Control-Allow-Methods", strings.Join(methods, ", "))
			headers.Add("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization")
			return
		}

		var methodAllowed bool
		for _, method := range methods {
			if method == req.Method {
				methodAllowed = true
				break
			}
		}
		if !methodAllowed {
			http.Error(res, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}

		handler.ServeHTTP(res, req)
	}
}
