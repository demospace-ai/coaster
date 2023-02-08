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
			Name:        "Create destination",
			Method:      router.POST,
			Pattern:     "/api/create_destination",
			HandlerFunc: s.CreateDestination,
		},
		{
			Name:        "Create sync configuration",
			Method:      router.POST,
			Pattern:     "/api/create_sync_configuration",
			HandlerFunc: s.CreateSyncConfiguration,
		},
		{
			Name:        "Test data connection",
			Method:      router.POST,
			Pattern:     "/api/test_data_connection",
			HandlerFunc: s.TestDataConnection,
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
			Name:        "Get all destinations",
			Method:      router.GET,
			Pattern:     "/api/get_destinations",
			HandlerFunc: s.GetDestinations,
		},
		{
			Name:        "Get all sync configurations",
			Method:      router.GET,
			Pattern:     "/api/get_sync_configurations",
			HandlerFunc: s.GetSyncConfigurations,
		},
		{
			Name:        "Get values for a specified column",
			Method:      router.GET,
			Pattern:     "/api/get_column_values",
			HandlerFunc: s.GetColumnValues,
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
