package handlers

import (
    "fmt"
	"net/http"
)

func Hello(_ Env, w http.ResponseWriter, r *http.Request) error {
    fmt.Fprintf(w, "hello world")
    return nil
}
