package api

import (
	"fmt"
	"net/http"
)

func (s Service) Hello(w http.ResponseWriter, r *http.Request) error {
	fmt.Fprintf(w, "hello world")
	return nil
}
