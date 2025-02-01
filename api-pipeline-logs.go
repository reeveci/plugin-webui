package main

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func HandlePipelineLogs(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		rc := http.NewResponseController(res)

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

		reader, err := entry.Logs.Reader()
		if err != nil {
			http.Error(res, fmt.Sprintf("error reading pipeline logs - %s", err), http.StatusInternalServerError)
			return
		}

		headers := res.Header()
		headers.Set("Content-Type", "text/plain")
		headers.Set("X-Content-Type-Options", "nosniff")

		rc.Flush()

		io.WriteString(res, strings.Repeat("#:INIT:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n", 13))

		rc.Flush()

		r := bufio.NewReader(reader)
    defer reader.Close()

		for {
			read, err := r.ReadBytes('\n')
			if err != nil {
				break
			}

			res.Write(read)
			rc.Flush()
		}
	}
}
