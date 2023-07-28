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
			Pattern:     "/check_session",
			HandlerFunc: s.CheckSession,
		},
		{
			Name:        "Logout",
			Method:      router.DELETE,
			Pattern:     "/logout",
			HandlerFunc: s.Logout,
		},
		{
			Name:        "Get API key",
			Method:      router.GET,
			Pattern:     "/api_key",
			HandlerFunc: s.GetApiKey,
		},
		{
			Name:        "Get all destinations",
			Method:      router.GET,
			Pattern:     "/destinations",
			HandlerFunc: s.GetDestinations,
		},
		{
			Name:        "Get destination",
			Method:      router.GET,
			Pattern:     "/destination/{destinationID}",
			HandlerFunc: s.GetDestination,
		},
		{
			Name:        "Get namespaces",
			Method:      router.GET,
			Pattern:     "/connection/namespaces",
			HandlerFunc: s.GetNamespaces,
		},
		{
			Name:        "Get tables for a given namespace",
			Method:      router.GET,
			Pattern:     "/connection/tables",
			HandlerFunc: s.GetTables,
		},
		{
			Name:        "Get schema for a given table",
			Method:      router.GET,
			Pattern:     "/connection/schema",
			HandlerFunc: s.GetSchema,
		},
		{
			Name:        "Get all syncs",
			Method:      router.GET,
			Pattern:     "/syncs",
			HandlerFunc: s.GetSyncs,
		},
		{
			Name:        "Query object record for customer",
			Method:      router.POST,
			Pattern:     "/customer/{endCustomerId}/object/{objectId}/record",
			HandlerFunc: s.QueryObjectRecord,
		},
		{
			Name:        "Get all users",
			Method:      router.GET,
			Pattern:     "/users",
			HandlerFunc: s.GetAllUsers,
		},
		{
			Name:        "Create destination for sync",
			Method:      router.POST,
			Pattern:     "/destination",
			HandlerFunc: s.CreateDestination,
		},
		{
			Name:        "Create source for sync",
			Method:      router.POST,
			Pattern:     "/source",
			HandlerFunc: s.CreateSource,
		},
		{
			Name:        "Create object for sync",
			Method:      router.POST,
			Pattern:     "/object",
			HandlerFunc: s.CreateObject,
		},
		{
			Name:        "Update an object for sync",
			Method:      router.PATCH,
			Pattern:     "/object/{objectID}",
			HandlerFunc: s.UpdateObject,
		},
		{
			Name:        "Update object fields for sync",
			Method:      router.PATCH,
			Pattern:     "/object/{objectID}/object_fields",
			HandlerFunc: s.UpdateObjectFields,
		},
		{
			Name:        "Get sync",
			Method:      router.GET,
			Pattern:     "/sync/{syncID}",
			HandlerFunc: s.GetSync,
		},
		{
			Name:        "Get values for a specified field",
			Method:      router.GET,
			Pattern:     "/connection/field_values",
			HandlerFunc: s.GetFieldValues,
		},
		{
			Name:        "Set organization for user",
			Method:      router.POST,
			Pattern:     "/organization",
			HandlerFunc: s.SetOrganization,
		},
	}
}

func (s ApiService) UnauthenticatedRoutes() []router.UnauthenticatedRoute {
	return []router.UnauthenticatedRoute{
		{
			Name:        "Hello",
			Method:      router.GET,
			Pattern:     "/hello",
			HandlerFunc: s.Hello,
		},
		{
			Name:        "OAuth Redirect",
			Method:      router.GET,
			Pattern:     "/oauth_redirect",
			HandlerFunc: s.OAuthRedirect,
		},
		{
			Name:        "OAuth Login",
			Method:      router.GET,
			Pattern:     "/oauth_login",
			HandlerFunc: s.OAuthLogin,
		},
	}
}
