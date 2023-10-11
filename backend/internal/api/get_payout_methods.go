package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/users"
	"go.fabra.io/server/common/stripe"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetPayoutMethods(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.User.StripeAccountID == nil {
		return json.NewEncoder(w).Encode([]views.PayoutMethod{})
	}

	stripeDetails, err := stripe.GetAccount(*auth.User.StripeAccountID)
	if err != nil {
		return errors.Wrap(err, "(api.getOrCreateStripeAccount) error getting stripe account")
	}

	if auth.User.StripeAccountStatus == models.StripeAccountStatusIncomplete && stripeDetails.DetailsSubmitted {
		_, err = users.UpdateStripeStatus(s.db, auth.User, models.StripeAccountStatusComplete)
		if err != nil {
			return errors.Wrap(err, "(api.GetPayoutMethods) error updating stripe account status")
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertPayoutMethods(stripeDetails.ExternalAccounts.Data))
}
