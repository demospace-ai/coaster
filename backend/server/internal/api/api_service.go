package api

import (
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/internal/router"

	"gorm.io/gorm"
)

type ApiService struct {
	db            *gorm.DB
	authService   auth.AuthService
	cryptoService crypto.CryptoService
	queryService  query.QueryService
}

func NewApiService(db *gorm.DB, authService auth.AuthService, cryptoService crypto.CryptoService, queryService query.QueryService) ApiService {
	return ApiService{
		db:            db,
		authService:   authService,
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
			Name:        "Get API key",
			Method:      router.GET,
			Pattern:     "/api/api_key",
			HandlerFunc: s.GetApiKey,
		},
		{
			Name:        "Get all destinations",
			Method:      router.GET,
			Pattern:     "/api/destinations",
			HandlerFunc: s.GetDestinations,
		},
		{
			Name:        "Get namespaces",
			Method:      router.GET,
			Pattern:     "/api/connection/namespaces",
			HandlerFunc: s.GetNamespaces,
		},
		{
			Name:        "Get tables for a given namespace",
			Method:      router.GET,
			Pattern:     "/api/connection/tables",
			HandlerFunc: s.GetTables,
		},
		{
			Name:        "Get schema for a given table",
			Method:      router.GET,
			Pattern:     "/api/connection/schema",
			HandlerFunc: s.GetSchema,
		},
		{
			Name:        "Get all sync configurations",
			Method:      router.GET,
			Pattern:     "/api/syncs",
			HandlerFunc: s.GetSyncs,
		},
		{
			Name:        "Get all users",
			Method:      router.GET,
			Pattern:     "/api/users",
			HandlerFunc: s.GetAllUsers,
		},
		{
			Name:        "Create destination for sync",
			Method:      router.POST,
			Pattern:     "/api/destination",
			HandlerFunc: s.CreateDestination,
		},
		{
			Name:        "Create source for sync",
			Method:      router.POST,
			Pattern:     "/api/source",
			HandlerFunc: s.CreateSource,
		},
		{
			Name:        "Create object for sync",
			Method:      router.POST,
			Pattern:     "/api/object",
			HandlerFunc: s.CreateObject,
		},
		{
			Name:        "Create sync",
			Method:      router.POST,
			Pattern:     "/api/sync",
			HandlerFunc: s.CreateSync,
		},
		{
			Name:        "Create link token",
			Method:      router.POST,
			Pattern:     "/api/link_token",
			HandlerFunc: s.CreateLinkToken,
		},
		{
			Name:        "Get values for a specified column",
			Method:      router.GET,
			Pattern:     "/api/connection/column_values",
			HandlerFunc: s.GetColumnValues,
		},
		{
			Name:        "Set organization for user",
			Method:      router.POST,
			Pattern:     "/api/organization",
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

// Only a subset of the APIs should be accessible with Link Token Authentication
func (s ApiService) LinkAuthenticatedRoutes() []router.LinkAuthenticatedRoute {
	return []router.LinkAuthenticatedRoute{
		{
			Name:        "Get all objects",
			Method:      router.GET,
			Pattern:     "/api/objects",
			HandlerFunc: s.GetObjects,
		},
		{
			Name:        "Get all sources",
			Method:      router.GET,
			Pattern:     "/api/link/sources",
			HandlerFunc: s.LinkGetSources,
		},
		{
			Name:        "Get source namespaces",
			Method:      router.GET,
			Pattern:     "/api/link/namespaces",
			HandlerFunc: s.LinkGetNamespaces,
		},
		{
			Name:        "Get tables for a given source and namespace",
			Method:      router.GET,
			Pattern:     "/api/link/tables",
			HandlerFunc: s.LinkGetTables,
		},
		{
			Name:        "Get schema for a given table",
			Method:      router.GET,
			Pattern:     "/api/link/schema",
			HandlerFunc: s.LinkGetSchema,
		},
		{
			Name:        "Create source for sync",
			Method:      router.POST,
			Pattern:     "/api/link/source",
			HandlerFunc: s.LinkCreateSource,
		},
		{
			Name:        "Create sync",
			Method:      router.POST,
			Pattern:     "/api/link/sync",
			HandlerFunc: s.LinkCreateSync,
		},
		{
			Name:        "Get preview",
			Method:      router.POST,
			Pattern:     "/api/link/preview",
			HandlerFunc: s.LinkGetPreview,
		},
		{
			Name:        "Test data connection",
			Method:      router.POST,
			Pattern:     "/api/connection/test",
			HandlerFunc: s.TestDataConnection,
		},
	}
}
