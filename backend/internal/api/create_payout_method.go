package api

import (
	"encoding/json"
	"net/http"

	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/models"
	"go.coaster.io/server/common/repositories/users"
	"go.coaster.io/server/common/stripe"
	"gorm.io/gorm"
)

func (s ApiService) CreatePayoutMethod(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	var stripeAccountID string
	if auth.User.StripeAccountID == nil {
		user, err := createStripeAccount(s.db, auth.User)
		if err != nil {
			return errors.Wrap(err, "(api.CreatePayoutMethod) error getting or creating stripe account")
		}
		stripeAccountID = *user.StripeAccountID
	} else {
		stripeAccountID = *auth.User.StripeAccountID
		isComplete, err := isStripeSetupComplete(s.db, auth.User)
		if err != nil {
			return errors.Wrap(err, "(api.CreatePayoutMethod) error getting stripe account status")
		}

		if isComplete {
			return errors.NewBadRequest("Stripe account already complete")
		}
	}

	accountLink, err := stripe.CreateAccountLink(stripeAccountID)
	if err != nil {
		return errors.Wrap(err, "(api.CreatePayoutMethod) error creating account link")
	}

	return json.NewEncoder(w).Encode(*accountLink)
}

func createStripeAccount(db *gorm.DB, user *models.User) (*models.User, error) {
	stripeID, err := stripe.CreateAccount()
	if err != nil {
		return nil, errors.Wrap(err, "(api.getOrCreateStripeAccount) error creating stripe account")
	}

	updatedUser, err := users.UpdateStripeAccountID(db, user, *stripeID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.getOrCreateStripeAccount) error adding stripe account ID to user")
	}

	return updatedUser, nil
}

func isStripeSetupComplete(db *gorm.DB, user *models.User) (bool, error) {
	if user.StripeAccountStatus == models.StripeAccountStatusComplete {
		return true, nil
	} else {
		stripeDetails, err := stripe.GetAccount(*user.StripeAccountID)
		if err != nil {
			return false, errors.Wrap(err, "(api.isStripeSetupComplete) error getting stripe account")
		}

		if stripeDetails.DetailsSubmitted {
			_, err = users.UpdateStripeStatus(db, user, models.StripeAccountStatusComplete)
			if err != nil {
				return false, errors.Wrap(err, "(api.isStripeSetupComplete) error updating stripe account status")
			}

			return true, nil
		}
	}

	return false, nil
}
