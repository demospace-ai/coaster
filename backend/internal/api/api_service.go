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
			Name:        "Delete listing",
			Method:      router.DELETE,
			Pattern:     "/listings/{listingID}",
			HandlerFunc: s.DeleteListing,
		},
		{
			Name:        "Add listing image",
			Method:      router.POST,
			Pattern:     "/listings/{listingID}/image",
			HandlerFunc: s.AddListingImage,
		},
		{
			Name:        "Delete listing image",
			Method:      router.DELETE,
			Pattern:     "/listings/{listingID}/image/{imageID}",
			HandlerFunc: s.DeleteListingImage,
		},
		{
			Name:        "Update listing images",
			Method:      router.PATCH,
			Pattern:     "/listings/{listingID}/images",
			HandlerFunc: s.UpdateListingImages,
		},
		{
			Name:        "Update listing",
			Method:      router.POST,
			Pattern:     "/listings/{listingID}",
			HandlerFunc: s.UpdateListing,
		},
		{
			Name:        "Get draft listing",
			Method:      router.GET,
			Pattern:     "/listings/draft",
			HandlerFunc: s.GetDraftListing,
		},
		{
			Name:        "Get hosted listing",
			Method:      router.GET,
			Pattern:     "/listings/hosted",
			HandlerFunc: s.GetHostedListings,
		},
		{
			Name:        "Update user",
			Method:      router.POST,
			Pattern:     "/user",
			HandlerFunc: s.UpdateUser,
		},
		{
			Name:        "Update profile picture",
			Method:      router.POST,
			Pattern:     "/user/profile_picture",
			HandlerFunc: s.UpdateProfilePicture,
		},
		{
			Name:        "Send invite",
			Method:      router.POST,
			Pattern:     "/send_invite",
			HandlerFunc: s.SendInvite,
		},
		{
			Name:        "Get availability rules",
			Method:      router.GET,
			Pattern:     "/listings/{listingID}/availability_rules",
			HandlerFunc: s.GetAvailabilityRules,
		},
		{
			Name:        "Create availability rule",
			Method:      router.POST,
			Pattern:     "/listings/{listingID}/availability_rules",
			HandlerFunc: s.CreateAvailability,
		},
		{
			Name:        "Delete availability rule",
			Method:      router.DELETE,
			Pattern:     "/listings/{listingID}/availability_rules/{availabilityRuleID}",
			HandlerFunc: s.DeleteAvailability,
		},
		{
			Name:        "Update availability rule",
			Method:      router.PATCH,
			Pattern:     "/listings/{listingID}/availability_rules/{availabilityRuleID}",
			HandlerFunc: s.UpdateAvailability,
		},
		{
			Name:        "Get payout methods",
			Method:      router.GET,
			Pattern:     "/payout_methods",
			HandlerFunc: s.GetPayoutMethods,
		},
		{
			Name:        "Create payout method",
			Method:      router.POST,
			Pattern:     "/payout_methods",
			HandlerFunc: s.CreatePayoutMethod,
		},
		{
			Name:        "Get Stripe dashboard link",
			Method:      router.GET,
			Pattern:     "/stripe_dashboard_link",
			HandlerFunc: s.GetStripeDashboardLink,
		},
		{
			Name:        "Create checkout link",
			Method:      router.POST,
			Pattern:     "/checkout_link",
			HandlerFunc: s.CreateCheckoutLink,
		},
		{
			Name:        "Get user bookings",
			Method:      router.GET,
			Pattern:     "/user_bookings",
			HandlerFunc: s.GetUserBookings,
		},
		{
			Name:        "Get user booking",
			Method:      router.GET,
			Pattern:     "/user_bookings/{bookingReference}",
			HandlerFunc: s.GetUserBooking,
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
			Name:        "Get all listing metadata",
			Method:      router.GET,
			Pattern:     "/listing_metadata",
			HandlerFunc: s.GetAllListingMetadata,
		},
		{
			Name:        "Get listing",
			Method:      router.GET,
			Pattern:     "/listings/{listingID}",
			HandlerFunc: s.GetListing,
		},
		{
			Name:        "Get availability",
			Method:      router.GET,
			Pattern:     "/listings/{listingID}/availability",
			HandlerFunc: s.GetAvailability,
		},
		{
			Name:        "Check email",
			Method:      router.GET,
			Pattern:     "/email",
			HandlerFunc: s.CheckEmail,
		},
		{
			Name:        "Create user",
			Method:      router.POST,
			Pattern:     "/register",
			HandlerFunc: s.CreateUser,
		},
		{
			Name:        "Send reset email",
			Method:      router.POST,
			Pattern:     "/send_reset",
			HandlerFunc: s.SendReset,
		},
		{
			Name:        "Reset password",
			Method:      router.POST,
			Pattern:     "/reset_password",
			HandlerFunc: s.ResetPassword,
		},
		{
			Name:        "Email login",
			Method:      router.POST,
			Pattern:     "/login",
			HandlerFunc: s.EmailLogin,
		},
		{
			Name:        "Join waitlist",
			Method:      router.POST,
			Pattern:     "/waitlist",
			HandlerFunc: s.JoinWaitlist,
		},
		{
			Name:        "Stripe webhook",
			Method:      router.POST,
			Pattern:     "/webhooks/stripe",
			HandlerFunc: s.WebhookStripe,
		},
	}
}
