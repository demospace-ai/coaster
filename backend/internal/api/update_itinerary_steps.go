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
	"go.fabra.io/server/common/repositories/itinerary_steps"
	"go.fabra.io/server/common/repositories/listings"
)

type UpdateItineraryStepsRequest = []input.ItineraryStep

func (s ApiService) UpdateItinerarySteps(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.UpdateItinerarySteps) missing listing ID from UpdateItinerarySteps request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateItinerarySteps)")
	}

	decoder := json.NewDecoder(r.Body)
	var updateItineraryStepsRequest UpdateItineraryStepsRequest
	err = decoder.Decode(&updateItineraryStepsRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateItinerarySteps) decoding request")
	}

	validate := validator.New()
	err = validate.Var(updateItineraryStepsRequest, "required,dive")
	if err != nil {
		return errors.Wrap(err, "(api.UpdateItinerarySteps) validating request")
	}

	// Make sure this user has ownership of this listing or is an admin
	_, err = listings.LoadByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateItinerarySteps) validating ownership of listing")
	}

	itineraryStep, err := itinerary_steps.UpdateItinerarySteps(
		s.db,
		listingID,
		updateItineraryStepsRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateItinerarySteps) updating itinerary steps")
	}

	return json.NewEncoder(w).Encode(itineraryStep)
}
