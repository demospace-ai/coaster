package api

import (
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/internal/router"

	"gorm.io/gorm"
)

type ApiService struct {
	db            *gorm.DB
	authService   auth.AuthService
	cryptoService crypto.CryptoService
}

func NewApiService(db *gorm.DB, authService auth.AuthService, cryptoService crypto.CryptoService) ApiService {
	return ApiService{
		db:            db,
		authService:   authService,
		cryptoService: cryptoService,
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
			Name:        "Create listing",
			Method:      router.POST,
			Pattern:     "/listings",
			HandlerFunc: s.CreateListing,
		},
		{
			Name:        "Upload listing image",
			Method:      router.POST,
			Pattern:     "/listings/{listingID}/image",
			HandlerFunc: s.UploadListingImage,
		},
		{
			Name:        "Update listing",
			Method:      router.POST,
			Pattern:     "/listings/{listingID}",
			HandlerFunc: s.UpdateListing,
		},
		{
			Name:        "Get new listing",
			Method:      router.GET,
			Pattern:     "/listings/new",
			HandlerFunc: s.GetNewListing,
		},
		{
			Name:        "Get hosted listing",
			Method:      router.GET,
			Pattern:     "/listings/hosted",
			HandlerFunc: s.GetHostedListings,
		},
	}
}

func (s ApiService) UnauthenticatedRoutes() []router.UnauthenticatedRoute {
	return []router.UnauthenticatedRoute{
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
		{
			Name:        "Search listings",
			Method:      router.GET,
			Pattern:     "/listings",
			HandlerFunc: s.SearchListings,
		},
		{
			Name:        "Get featured listings",
			Method:      router.GET,
			Pattern:     "/featured",
			HandlerFunc: s.GetFeaturedListings,
		},
		{
			Name:        "Get listing",
			Method:      router.GET,
			Pattern:     "/listings/{listingID}",
			HandlerFunc: s.GetListing,
		},
	}
}
