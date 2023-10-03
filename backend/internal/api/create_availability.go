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
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
)

type CreateAvailabilityRequest = input.AvailabilityRule

type CreateAvailabilityResponse struct {
}

func (s ApiService) CreateAvailability(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.CreateAvailability) missing listing ID from CreateAvailability request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability)")
	}

	decoder := json.NewDecoder(r.Body)
	var createAvailabilityRequest CreateAvailabilityRequest
	err = decoder.Decode(&createAvailabilityRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(createAvailabilityRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) validating request")
	}

	listing, err := listings.LoadByIDAndUserID(s.db, auth.User.ID, listingID)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) validating request")
	}

	if listing.AvailabilityType == models.AvailabilityTypeDateTime && len(createAvailabilityRequest.TimeSlots) == 0 {
		return errors.NewCustomerVisibleError("You must provide at least one time slot for listings that are booked by time.")
	}

	availability, err := availability_rules.CreateAvailability(
		s.db,
		listingID,
		createAvailabilityRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) creating availability rule")
	}

	return json.NewEncoder(w).Encode(availability)
}
