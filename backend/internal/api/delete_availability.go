package api

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
)

func (s ApiService) DeleteAvailability(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.DeleteAvailability) missing listing ID from DeleteAvailability request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteAvailability)")
	}

	strAvailabilityRuleID, ok := vars["availabilityRuleID"]
	if !ok {
		return errors.Newf("(api.DeleteAvailability) missing availability rule ID from DeleteAvailability request URL: %s", r.URL.RequestURI())
	}

	availabilityRuleID, err := strconv.ParseInt(strAvailabilityRuleID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteAvailability)")
	}

	_, err = listings.LoadByIDAndUserID(s.db, auth.User.ID, listingID)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteAvailability) validating request")
	}

	err = availability_rules.DeactivateAvailability(
		s.db,
		availabilityRuleID,
	)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteAvailability) deactivating availability rule")
	}

	return nil
}
