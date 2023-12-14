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
		vars := mux.Vars(req)

		workerGroup := vars["workerGroup"]
		if workerGroup == "" {
			http.Error(res, "missing worker group path parameter", http.StatusBadRequest)
			return
		}

		id := vars["id"]
		if id == "" {
			http.Error(res, "missing id path parameter", http.StatusBadRequest)
			return
		}

		entry, ok := p.History.Get(workerGroup, id)
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

		flusher, hasFlusher := res.(http.Flusher)

		if !hasFlusher {
			headers.Set("Transfer-Encoding", "chunked")
		}

		res.WriteHeader(http.StatusOK)

		if hasFlusher {
			flusher.Flush()
		}

		io.WriteString(res, strings.Repeat("#:INIT:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n", 13))

		if hasFlusher {
			flusher.Flush()

			r := bufio.NewReader(reader)

			for {
				read, err := r.ReadBytes('\n')
				if err != nil {
					break
				}

				res.Write(read)
				flusher.Flush()
			}
		} else {
			io.Copy(res, reader)
		}

		reader.Close()
	}
}
