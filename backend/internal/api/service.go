package api

import (
	"fabra/internal/route"

	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return Service{
		db: db,
	}
}

func (s Service) AuthenticatedRoutes() []route.AuthenticatedRoute {
	return []route.AuthenticatedRoute{
		{
			Name:        "Check session",
			Method:      route.GET,
			Pattern:     "/api/check_session",
			HandlerFunc: s.CheckSession,
		},
		{
			Name:        "Logout",
			Method:      route.DELETE,
			Pattern:     "/api/logout",
			HandlerFunc: s.Logout,
		},
		{
			Name:        "Search",
			Method:      route.POST,
			Pattern:     "/api/search",
			HandlerFunc: s.Search,
		},
		{
			Name:        "Create analysis",
			Method:      route.POST,
			Pattern:     "/api/create_analysis",
			HandlerFunc: s.CreateAnalysis,
		},
		{
			Name:        "Update analysis",
			Method:      route.PATCH,
			Pattern:     "/api/update_analysis",
			HandlerFunc: s.UpdateAnalysis,
		},
		{
			Name:        "Create data connection",
			Method:      route.POST,
			Pattern:     "/api/create_data_connection",
			HandlerFunc: s.CreateDataConnection,
		},
		{
			Name:        "Create event set",
			Method:      route.POST,
			Pattern:     "/api/create_event_set",
			HandlerFunc: s.CreateEventSet,
		},
		{
			Name:        "Test data connection",
			Method:      route.POST,
			Pattern:     "/api/test_data_connection",
			HandlerFunc: s.TestDataConnection,
		},
		{
			Name:        "Run query",
			Method:      route.POST,
			Pattern:     "/api/run_query",
			HandlerFunc: s.RunQuery,
		},
		{
			Name:        "Get datasets",
			Method:      route.GET,
			Pattern:     "/api/get_datasets",
			HandlerFunc: s.GetDatasets,
		},
		{
			Name:        "Get tables for a given data source and dataset",
			Method:      route.GET,
			Pattern:     "/api/get_tables",
			HandlerFunc: s.GetTables,
		},
		{
			Name:        "Get schema for a given table",
			Method:      route.GET,
			Pattern:     "/api/get_schema",
			HandlerFunc: s.GetSchema,
		},
		{
			Name:        "Get all users in an organization",
			Method:      route.GET,
			Pattern:     "/api/get_all_users",
			HandlerFunc: s.GetAllUsers,
		},
		{
			Name:        "Get all analyses for an organization. Paginated",
			Method:      route.GET,
			Pattern:     "/api/get_all_analyses",
			HandlerFunc: s.GetAllAnalyses,
		},
		{
			Name:        "Get all data connections",
			Method:      route.GET,
			Pattern:     "/api/get_data_connections",
			HandlerFunc: s.GetDataConnections,
		},
		{
			Name:        "Get all event sets",
			Method:      route.GET,
			Pattern:     "/api/get_event_sets",
			HandlerFunc: s.GetEventSets,
		},
		{
			Name:        "Get all events",
			Method:      route.GET,
			Pattern:     "/api/get_events",
			HandlerFunc: s.GetEvents,
		},
		{
			Name:        "Get analysis",
			Method:      route.GET,
			Pattern:     "/api/get_analysis/{analysisID}",
			HandlerFunc: s.GetAnalysis,
		},
		{
			Name:        "Delete analysis",
			Method:      route.DELETE,
			Pattern:     "/api/delete_analysis/{analysisID}",
			HandlerFunc: s.DeleteAnalysis,
		},
		{
			Name:        "Send validation code",
			Method:      route.POST,
			Pattern:     "/api/validation_code",
			HandlerFunc: s.ValidationCode,
		},
		{
			Name:        "Set organization for user",
			Method:      route.POST,
			Pattern:     "/api/set_organization",
			HandlerFunc: s.SetOrganization,
		},
	}
}

func (s Service) UnauthenticatedRoutes() []route.UnauthenticatedRoute {
	return []route.UnauthenticatedRoute{
		{
			Name:        "Hello",
			Method:      route.GET,
			Pattern:     "/api/hello",
			HandlerFunc: s.Hello,
		},
		{
			Name:        "Login",
			Method:      route.POST,
			Pattern:     "/api/login",
			HandlerFunc: s.Login,
		},
	}
}
