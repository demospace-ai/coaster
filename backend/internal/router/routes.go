package router

import (
	"net/http"

	"fabra/internal/handlers"
)

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

var Routes = []Route{
	Route{
		Name:        "Hello",
		Method:      "GET",
		Pattern:     "/hello",
		HandlerFunc: handlers.Hello,
	},
}
