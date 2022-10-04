package api

import (
	"fabra/internal/crypto"
	"fabra/internal/query"
	"fabra/internal/router"

	"gorm.io/gorm"
)

type ApiService struct {
	db            *gorm.DB
	cryptoService crypto.CryptoService
	queryService  query.QueryService
}

func NewApiService(db *gorm.DB, cryptoService crypto.CryptoService, queryService query.QueryService) ApiService {
	return ApiService{
		db:            db,
		cryptoService: cryptoService,
		queryService:  queryService,
	}
}

func (s ApiService) AuthenticatedRoutes() []router.AuthenticatedRoute {
	return []router.AuthenticatedRoute{
		{
			Name:        "Check session",
			Method:      router.GET,
			Pattern:     "/api/check_session",
			HandlerFunc: s.CheckSession,
		},
		{
			Name:        "Logout",
			Method:      router.DELETE,
			Pattern:     "/api/logout",
			HandlerFunc: s.Logout,
		},
		{
			Name:        "Search",
			Method:      router.POST,
			Pattern:     "/api/search",
			HandlerFunc: s.Search,
		},
		{
			Name:        "Create analysis",
			Method:      router.POST,
			Pattern:     "/api/create_analysis",
			HandlerFunc: s.CreateAnalysis,
		},
		{
			Name:        "Update analysis",
			Method:      router.PATCH,
			Pattern:     "/api/update_analysis",
			HandlerFunc: s.UpdateAnalysis,
		},
		{
			Name:        "Create data connection",
			Method:      router.POST,
			Pattern:     "/api/create_data_connection",
			HandlerFunc: s.CreateDataConnection,
		},
		{
			Name:        "Create event set",
			Method:      router.POST,
			Pattern:     "/api/create_event_set",
			HandlerFunc: s.CreateEventSet,
		},
		{
			Name:        "Test data connection",
			Method:      router.POST,
			Pattern:     "/api/test_data_connection",
			HandlerFunc: s.TestDataConnection,
		},
		{
			Name:        "Run query",
			Method:      router.POST,
			Pattern:     "/api/run_query",
			HandlerFunc: s.RunQuery,
		},
		{
			Name:        "Get datasets",
			Method:      router.GET,
			Pattern:     "/api/get_datasets",
			HandlerFunc: s.GetDatasets,
		},
		{
			Name:        "Get tables for a given data source and dataset",
			Method:      router.GET,
			Pattern:     "/api/get_tables",
			HandlerFunc: s.GetTables,
		},
		{
			Name:        "Get schema for a given table",
			Method:      router.GET,
			Pattern:     "/api/get_schema",
			HandlerFunc: s.GetSchema,
		},
		{
			Name:        "Get all users in an organization",
			Method:      router.GET,
			Pattern:     "/api/get_all_users",
			HandlerFunc: s.GetAllUsers,
		},
		{
			Name:        "Get all analyses for an organization. Paginated",
			Method:      router.GET,
			Pattern:     "/api/get_all_analyses",
			HandlerFunc: s.GetAllAnalyses,
		},
		{
			Name:        "Get all data connections",
			Method:      router.GET,
			Pattern:     "/api/get_data_connections",
			HandlerFunc: s.GetDataConnections,
		},
		{
			Name:        "Get all event sets",
			Method:      router.GET,
			Pattern:     "/api/get_event_sets",
			HandlerFunc: s.GetEventSets,
		},
		{
			Name:        "Get all events",
			Method:      router.GET,
			Pattern:     "/api/get_events",
			HandlerFunc: s.GetEvents,
		},
		{
			Name:        "Get properties for an event set",
			Method:      router.GET,
			Pattern:     "/api/get_properties",
			HandlerFunc: s.GetProperties,
		},
		{
			Name:        "Run funnel query",
			Method:      router.POST,
			Pattern:     "/api/run_funnel_query",
			HandlerFunc: s.RunFunnelQuery,
		},
		{
			Name:        "Get analysis",
			Method:      router.GET,
			Pattern:     "/api/get_analysis/{analysisID}",
			HandlerFunc: s.GetAnalysis,
		},
		{
			Name:        "Delete analysis",
			Method:      router.DELETE,
			Pattern:     "/api/delete_analysis/{analysisID}",
			HandlerFunc: s.DeleteAnalysis,
		},
		{
			Name:        "Send validation code",
			Method:      router.POST,
			Pattern:     "/api/validation_code",
			HandlerFunc: s.ValidationCode,
		},
		{
			Name:        "Set organization for user",
			Method:      router.POST,
			Pattern:     "/api/set_organization",
			HandlerFunc: s.SetOrganization,
		},
	}
}

func (s ApiService) UnauthenticatedRoutes() []router.UnauthenticatedRoute {
	return []router.UnauthenticatedRoute{
		{
			Name:        "Hello",
			Method:      router.GET,
			Pattern:     "/api/hello",
			HandlerFunc: s.Hello,
		},
		{
			Name:        "Login",
			Method:      router.POST,
			Pattern:     "/api/login",
			HandlerFunc: s.Login,
		},
	}
}
