package stripe

import (
	"context"

	"github.com/stripe/stripe-go/v75"
	"github.com/stripe/stripe-go/v75/client"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/secret"
)

const STRIPE_PROD_API_KEY_KEY = "projects/454026596701/secrets/stripe-api-key/versions/latest"
const STRIPE_DEV_API_KEY_KEY = "projects/86315250181/secrets/stripe-dev-api-key/versions/latest"

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
