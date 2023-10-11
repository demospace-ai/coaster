package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/stripe"
)

func (s ApiService) GetStripeDashboardLink(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.User.StripeAccountID == nil || auth.User.StripeAccountStatus != models.StripeAccountStatusComplete {
		return errors.NewBadRequest("Must setup Stripe account first.")
	}

	loginLink, err := stripe.CreateLoginLink(*auth.User.StripeAccountID)
	if err != nil {
		return errors.Wrap(err, "(api.CreateStripeLogin) error creating account link")
	}

	return json.NewEncoder(w).Encode(*loginLink)
}
