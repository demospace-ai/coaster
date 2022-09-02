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
		Name:        "Logout",
		Method:      "DELETE",
		Pattern:     "/api/logout",
		HandlerFunc: handlers.Logout,
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
		Name:        "Create data connection",
		Method:      "POST",
		Pattern:     "/api/create_data_connection",
		HandlerFunc: handlers.CreateDataConnection,
	},
	{
		Name:        "Test data connection",
		Method:      "POST",
		Pattern:     "/api/test_data_connection",
		HandlerFunc: handlers.TestDataConnection,
	},
	{
		Name:        "Run query",
		Method:      "POST",
		Pattern:     "/api/run_query",
		HandlerFunc: handlers.RunQuery,
	},
	{
		Name:        "Get all users in an organization",
		Method:      "GET",
		Pattern:     "/api/get_all_users",
		HandlerFunc: handlers.GetAllUsers,
	},
	{
		Name:        "Get all assigned questions for a user",
		Method:      "GET",
		Pattern:     "/api/get_assigned_questions",
		HandlerFunc: handlers.GetAssignedQuestions,
	},
	{
		Name:        "Get all questions for an organization. Paginated",
		Method:      "GET",
		Pattern:     "/api/get_all_questions",
		HandlerFunc: handlers.GetAllQuestions,
	},
	{
		Name:        "Get all data connections",
		Method:      "GET",
		Pattern:     "/api/get_data_connections",
		HandlerFunc: handlers.GetDataConnections,
	},
	{
		Name:        "Create answer",
		Method:      "POST",
		Pattern:     "/api/create_answer",
		HandlerFunc: handlers.CreateAnswer,
	},
	{
		Name:        "Get question",
		Method:      "GET",
		Pattern:     "/api/get_question/{questionID}",
		HandlerFunc: handlers.GetQuestion,
	},
	{
		Name:        "Send validation code",
		Method:      "POST",
		Pattern:     "/api/validation_code",
		HandlerFunc: handlers.ValidationCode,
	},
	{
		Name:        "Set organization for user",
		Method:      "POST",
		Pattern:     "/api/set_organization",
		HandlerFunc: handlers.SetOrganization,
	},
}
