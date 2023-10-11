package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
)

type GetAvailabilityResponse struct {
	AvailableDays []time.Time `json:"available_days"`
}

func (s ApiService) GetAvailability(w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.GetAvailability) missing listing ID from GetAvailability request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.GetAvailability)")
	}

	startDateParam := r.URL.Query().Get("start_date")
	if len(startDateParam) == 0 {
		return errors.NewCustomerVisibleError("Must specify start date for checking availability.")
	}
	startDate, err := time.Parse(time.DateOnly, startDateParam)
	if err != nil {
		return errors.NewCustomerVisibleError("Invalid start date")
	}

	endDateParam := r.URL.Query().Get("end_date")
	if len(endDateParam) == 0 {
		return errors.NewCustomerVisibleError("Must specify end date for checking availability.")
	}
	endDate, err := time.Parse(time.DateOnly, endDateParam)
	if err != nil {
		return errors.NewCustomerVisibleError("Invalid end date")
	}

	auth, err := s.authService.GetAuthentication(r)
	if err != nil {
		return errors.Wrap(err, "(api.GetAvailability) unexpected authentication error")
	}

	listing, err := listings.LoadByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.GetAvailability) loading listing")
	}

	availableDays, err := availability_rules.LoadAvailabilityInRange(
		s.db,
		*listing,
		startDate,
		endDate,
	)
	if err != nil {
		return errors.Wrap(err, "(api.GetAvailability) creating availability rule")
	}

	return json.NewEncoder(w).Encode(availableDays)
}
