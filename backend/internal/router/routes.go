package router

import (
	"net/http"

	"fabra/internal/handlers"
)

type EnvHandlerFunc func(http.ResponseWriter, *http.Request) error
type BaseHandlerFunc func(handlers.Env, http.ResponseWriter, *http.Request) error

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc BaseHandlerFunc
}

var Routes = []Route{
	{
		Name:        "Hello",
		Method:      "GET",
		Pattern:     "/hello",
		HandlerFunc: handlers.Hello,
	},
	{
		Name:        "Check session",
		Method:      "GET",
		Pattern:     "/check_session",
		HandlerFunc: handlers.CheckSession,
	},
	{
		Name:        "Login",
		Method:      "POST",
		Pattern:     "/login",
		HandlerFunc: handlers.Login,
	},
	{
		Name:        "Search",
		Method:      "POST",
		Pattern:     "/search",
		HandlerFunc: handlers.Search,
	},
	{
		Name:        "Create question",
		Method:      "POST",
		Pattern:     "/create_question",
		HandlerFunc: handlers.CreateQuestion,
	},
	{
		Name:        "Slack event webhook",
		Method:      "POST",
		Pattern:     "/slack_event_webhook",
		HandlerFunc: handlers.SlackEvent,
	},
	{
		Name:        "Send validation code",
		Method:      "POST",
		Pattern:     "/validation_code",
		HandlerFunc: handlers.ValidationCode,
	},
}
