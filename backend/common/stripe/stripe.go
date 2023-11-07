package stripe

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/stripe/stripe-go/v75"
	"github.com/stripe/stripe-go/v75/client"
	"github.com/stripe/stripe-go/v75/webhook"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/images"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/secret"
)

const STRIPE_PROD_API_KEY_KEY = "projects/454026596701/secrets/stripe-api-key/versions/latest"
const STRIPE_DEV_API_KEY_KEY = "projects/86315250181/secrets/stripe-dev-api-key/versions/latest"

const STRIPE_PROD_ENDPOINT_SECRET_KEY = "projects/454026596701/secrets/stripe-endpoint-secret/versions/latest"
const STRIPE_DEV_ENDPOINT_SECRET_KEY = "projects/86315250181/secrets/stripe-dev-endpoint-secret/versions/latest"

func CreateAccount() (*string, error) {
	stripeApiKey, err := secret.FetchSecret(context.TODO(), getStripeApiKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateAccount) fetching secret")
	}

	sc := &client.API{}
	sc.Init(*stripeApiKey, nil)

	params := &stripe.AccountParams{
		Type: stripe.String(string(stripe.AccountTypeExpress)),
	}
	result, err := sc.Accounts.New(params)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateAccount) creating account")
	}

	return &result.ID, nil
}

func CreateAccountLink(accountID string) (*string, error) {
	stripeApiKey, err := secret.FetchSecret(context.TODO(), getStripeApiKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateAccountLink) fetching secret")
	}

	sc := &client.API{}
	sc.Init(*stripeApiKey, nil)

	returnLink := getReturnLink()
	refreshLink := getRefreshLink()
	linkType := string(stripe.AccountLinkTypeAccountOnboarding)

	params := &stripe.AccountLinkParams{
		Account:    stripe.String(accountID),
		RefreshURL: stripe.String(refreshLink),
		ReturnURL:  stripe.String(returnLink),
		Type:       stripe.String(linkType),
	}
	result, err := sc.AccountLinks.New(params)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateAccountLink) creating account link")
	}

	return &result.URL, nil
}

func CreateLoginLink(accountID string) (*string, error) {
	stripeApiKey, err := secret.FetchSecret(context.TODO(), getStripeApiKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateLoginLink) fetching secret")
	}

	sc := &client.API{}
	sc.Init(*stripeApiKey, nil)

	params := &stripe.LoginLinkParams{
		Account: stripe.String(accountID),
	}
	result, err := sc.LoginLinks.New(params)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateLoginLink) creating login link")
	}

	return &result.URL, nil
}

func CreateCheckoutSession(user *models.User, listing *listings.ListingDetails, booking *models.Booking) (*stripe.CheckoutSession, error) {
	stripeApiKey, err := secret.FetchSecret(context.TODO(), getStripeApiKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateCheckoutSession) fetching secret")
	}

	sc := &client.API{}
	sc.Init(*stripeApiKey, nil)

	unitPrice := *listing.Price * 100
	commission := booking.Guests * unitPrice * listing.Host.CommissionPercent // No need to divide percent by 100 because Stripe uses cents and we use dollars
	expiresAt := time.Now().Add(35 * time.Minute).Unix()                      // Stripe minimum is 30 minutes

	params := &stripe.CheckoutSessionParams{
		Mode:                stripe.String(string(stripe.CheckoutSessionModePayment)),
		AllowPromotionCodes: stripe.Bool(true),
		ClientReferenceID:   stripe.String(fmt.Sprintf("%d", booking.ID)),
		CustomerEmail:       stripe.String(user.Email),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String(listing.Host.Currency),
					UnitAmount: stripe.Int64(unitPrice),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(*listing.Name),
						Images: []*string{
							stripe.String(images.GetGcsImageUrl(listing.Images[0].StorageID)),
						},
						Description: stripe.String("You won't be charged until this reservation is confirmed by the trip provider."),
					},
				},
				Quantity: stripe.Int64(booking.Guests),
			},
		},
		PaymentIntentData: &stripe.CheckoutSessionPaymentIntentDataParams{
			ApplicationFeeAmount: stripe.Int64(commission),
			TransferData: &stripe.CheckoutSessionPaymentIntentDataTransferDataParams{
				Destination: stripe.String(*listing.Host.StripeAccountID),
			},
			CaptureMethod: stripe.String(string(stripe.PaymentIntentCaptureMethodManual)),
		},
		SuccessURL: stripe.String(getSuccessURL(booking.ID)),
		CancelURL:  stripe.String(getCancelURL(listing.ID)),
		ExpiresAt:  &expiresAt,
		Metadata: map[string]string{
			"booking_id": fmt.Sprintf("%d", booking.ID),
		},
	}

	return sc.CheckoutSessions.New(params)
}

func VerifyWebhookRequest(payload []byte, signature string) (*stripe.Event, error) {
	stripeEndpointSecret, err := secret.FetchSecret(context.TODO(), getStripeEndpointSecretKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.VerifyWebhookRequest) fetching secret")
	}

	event, err := webhook.ConstructEvent(payload, signature, *stripeEndpointSecret)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.VerifyWebhookRequest) verifying webhook request")
	}

	return &event, nil
}

func UnmarshallCheckoutSession(event *stripe.Event) (*stripe.CheckoutSession, error) {
	var checkoutSession stripe.CheckoutSession
	err := json.Unmarshal(event.Data.Raw, &checkoutSession)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.UnmarshallCheckoutComplete) unmarshalling checkout session")
	}

	return &checkoutSession, nil
}

func GetAccount(accountID string) (*stripe.Account, error) {
	stripeApiKey, err := secret.FetchSecret(context.TODO(), getStripeApiKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.GetAccount) fetching secret")
	}

	sc := &client.API{}
	sc.Init(*stripeApiKey, nil)

	params := &stripe.AccountParams{}
	result, err := sc.Accounts.GetByID(accountID, params)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.GetAccount) getting account")
	}

	return result, nil
}

func getStripeApiKey() string {
	if application.IsProd() {
		return STRIPE_PROD_API_KEY_KEY
	} else {
		return STRIPE_DEV_API_KEY_KEY
	}
}

func getStripeEndpointSecretKey() string {
	if application.IsProd() {
		return STRIPE_PROD_ENDPOINT_SECRET_KEY
	} else {
		return STRIPE_DEV_ENDPOINT_SECRET_KEY
	}
}

func getReturnLink() string {
	if application.IsProd() {
		return "https://supplier.trycoaster.com/finance/payout-methods"
	} else {
		return "http://localhost:3030/finance/payout-methods"
	}
}

func getRefreshLink() string {
	if application.IsProd() {
		return "https://supplier.trycoaster.com/finance/payout-methods"
	} else {
		return "http://localhost:3030/finance/payout-methods"
	}
}

func getSuccessURL(bookingID int64) string {
	if application.IsProd() {
		return fmt.Sprintf("https://trycoaster.com/reservations/%d/success?session_id={CHECKOUT_SESSION_ID}", bookingID)
	} else {
		return fmt.Sprintf("http://localhost:3000/reservations/%d/success?session_id={CHECKOUT_SESSION_ID}", bookingID)
	}
}

func getCancelURL(listingID int64) string {
	if application.IsProd() {
		return fmt.Sprintf("https://trycoaster.com/listings/%d", listingID)
	} else {
		return fmt.Sprintf("http://localhost:3000/listings/%d", listingID)
	}
}
