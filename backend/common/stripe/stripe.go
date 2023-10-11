package stripe

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/stripe/stripe-go/v75"
	"github.com/stripe/stripe-go/v75/client"
	"github.com/stripe/stripe-go/v75/webhook"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
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

	params := &stripe.AccountParams{Type: stripe.String(string(stripe.AccountTypeExpress))}
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

	params := &stripe.AccountLinkParams{
		Account:    stripe.String(accountID),
		RefreshURL: stripe.String(refreshLink),
		ReturnURL:  stripe.String(returnLink),
		Type:       stripe.String("account_onboarding"),
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

func GetCheckoutLink(user *models.User, host *models.User, listing *models.Listing, booking *models.Booking) (*string, error) {
	stripeApiKey, err := secret.FetchSecret(context.TODO(), getStripeApiKey())
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.GetCheckoutLink) fetching secret")
	}

	sc := &client.API{}
	sc.Init(*stripeApiKey, nil)

	unitPrice := *listing.Price
	commission := (booking.Guests * unitPrice) * (host.CommissionPercent / 100)

	params := &stripe.CheckoutSessionParams{
		Mode:              stripe.String(string(stripe.CheckoutSessionModePayment)),
		ClientReferenceID: stripe.String(fmt.Sprintf("%d", listing.ID)),
		CustomerEmail:     stripe.String(user.Email),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String(host.Currency),
					UnitAmount: stripe.Int64(unitPrice),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(*listing.Name),
					},
				},
				Quantity: stripe.Int64(booking.Guests),
			},
		},
		PaymentIntentData: &stripe.CheckoutSessionPaymentIntentDataParams{
			ApplicationFeeAmount: stripe.Int64(commission),
			TransferData: &stripe.CheckoutSessionPaymentIntentDataTransferDataParams{
				Destination: stripe.String(*host.StripeAccountID),
			},
		},
		SuccessURL: stripe.String(getSuccessURL()),
		CancelURL:  stripe.String(getCancelURL(listing)),
		Metadata: map[string]string{
			"booking_id": fmt.Sprintf("%d", booking.ID),
		},
	}

	result, err := sc.CheckoutSessions.New(params)
	if err != nil {
		return nil, errors.Wrap(err, "(stripe.CreateCheckoutLink) creating login link")
	}

	return &result.URL, nil
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

func UnmarshallCheckoutComplete(event *stripe.Event) (*stripe.CheckoutSession, error) {
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
		return "http://localhost:3000/finance/payout-methods"
	}
}

func getRefreshLink() string {
	if application.IsProd() {
		return "https://supplier.trycoaster.com/finance/payout-methods"
	} else {
		return "http://localhost:3000/finance/payout-methods"
	}
}

func getSuccessURL() string {
	if application.IsProd() {
		return "https://trycoaster.com/reservations/success?session_id={CHECKOUT_SESSION_ID}"
	} else {
		return "http://localhost:3000/reservations/success?session_id={CHECKOUT_SESSION_ID}"
	}
}

func getCancelURL(listing *models.Listing) string {
	if application.IsProd() {
		return fmt.Sprintf("https://trycoaster.com/listings/%d", listing.ID)
	} else {
		return fmt.Sprintf("http://localhost:3000/listings/%d", listing.ID)
	}
}
