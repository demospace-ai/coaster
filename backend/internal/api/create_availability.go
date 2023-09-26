package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
)

type CreateAvailabilityRequest = input.AvailabilityRule

type CreateAvailabilityResponse struct {
}

func (s ApiService) CreateAvailability(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var createAvailabilityRequest CreateAvailabilityRequest
	err := decoder.Decode(&createAvailabilityRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(createAvailabilityRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) validating request")
	}

	_, err = listings.LoadByIDAndUserID(s.db, auth.User.ID, createAvailabilityRequest.ListingID)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) validating request")
	}

	// TODO: pass other fields
	availability, err := availability_rules.CreateAvailability(
		s.db,
		createAvailabilityRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.CreateAvailability) creating listing")
	}

	return json.NewEncoder(w).Encode(availability)
}
