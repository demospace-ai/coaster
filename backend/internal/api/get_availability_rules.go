package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetAvailabilityRules(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.GetListing) missing listing ID from GetListing request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.GetListing)")
	}

	// Check user has access to listing
	_, err = listings.LoadByIDAndUser(
		s.db,
		listingID,
		auth.User,
	)
	if err != nil {
		return errors.Wrap(err, "(api.GetListing) loading listing")
	}

	availabilityRules, err := availability_rules.LoadForListing(s.db, listingID)
	if err != nil {
		return errors.Wrap(err, "(api.GetAvailabilityRules) loading availability rules")
	}

	return json.NewEncoder(w).Encode(views.ConvertAvailabilityRules(availabilityRules))
}
