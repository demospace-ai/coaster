package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-playground/validator"
	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
)

type UpdateAvailabilityRequest = input.AvailabilityRuleUpdates

func (s ApiService) UpdateAvailability(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.UpdateAvailability) missing listing ID from UpdateAvailability request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateAvailability) parsing listing ID")
	}

	strAvailabilityRuleID, ok := vars["availabilityRuleID"]
	if !ok {
		return errors.Newf("(api.UpdateAvailability) missing availability rule ID from UpdateAvailability request URL: %s", r.URL.RequestURI())
	}

	availabilityRuleID, err := strconv.ParseInt(strAvailabilityRuleID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateAvailability)")
	}

	decoder := json.NewDecoder(r.Body)
	var updateAvailabilityRequest UpdateAvailabilityRequest
	err = decoder.Decode(&updateAvailabilityRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateAvailability) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(updateAvailabilityRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateAvailability) validating request")
	}

	// Make sure this user has ownership of this listing or is an admin
	_, err = listings.LoadByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrapf(err, "(api.UpdateAvailability) loading listing %d for user %d", listingID, auth.User.ID)
	}

	existingRule, err := availability_rules.LoadByID(s.db, availabilityRuleID)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateAvailability) loading availability rule")
	}

	availabilityRule, err := availability_rules.UpdateAvailability(
		s.db,
		existingRule,
		updateAvailabilityRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateAvailability) creating availability rule")
	}

	return json.NewEncoder(w).Encode(availabilityRule)
}
