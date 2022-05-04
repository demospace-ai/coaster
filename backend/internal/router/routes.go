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
		Pattern:     "/api/hello",
		HandlerFunc: handlers.Hello,
	},
	{
		Name:        "Check session",
		Method:      "GET",
		Pattern:     "/api/check_session",
		HandlerFunc: handlers.CheckSession,
	},
	{
		Name:        "Login",
		Method:      "POST",
		Pattern:     "/api/login",
		HandlerFunc: handlers.Login,
	},
	{
		Name:        "Search",
		Method:      "POST",
		Pattern:     "/api/search",
		HandlerFunc: handlers.Search,
	},
	{
		Name:        "Create question",
		Method:      "POST",
		Pattern:     "/api/create_question",
		HandlerFunc: handlers.CreateQuestion,
	},
	{
		Name:        "Create answer",
		Method:      "POST",
		Pattern:     "/api/create_answer",
		HandlerFunc: handlers.CreateAnswer,
	},
	{
		Name:        "Slack event webhook",
		Method:      "POST",
		Pattern:     "/api/slack_event_webhook",
		HandlerFunc: handlers.SlackEvent,
	},
	{
		Name:        "Send validation code",
		Method:      "POST",
		Pattern:     "/api/validation_code",
		HandlerFunc: handlers.ValidationCode,
	},
}
