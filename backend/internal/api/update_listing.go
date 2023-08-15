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
	"go.fabra.io/server/common/maps"
	"go.fabra.io/server/common/repositories/listings"
)

type UpdateListingRequest = input.ListingUpdates

type UpdateListingResponse struct {
	ListingId int64 `json:"listing_id"`
}

func (s ApiService) UpdateListing(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.UpdateListing) missing listing ID from UpdateListing request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateListing) parsing listing ID")
	}

	decoder := json.NewDecoder(r.Body)
	var updateListingRequest UpdateListingRequest
	err = decoder.Decode(&updateListingRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateListing) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(updateListingRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateListing) validating request")
	}

	listing, err := listings.LoadByUserAndID(s.db, auth.User.ID, listingID)
	if err != nil {
		return errors.Wrapf(err, "(api.UpdateListing) loading listing %d for user %d", listingID, auth.User.ID)
	}

	if updateListingRequest.Location != nil {
		location, err := maps.GetLocationFromQuery(*updateListingRequest.Location)
		if err != nil {
			return errors.Wrap(err, "(api.UpdateListing) getting location from query")
		}

		coordinates, err := maps.GetCoordinatesFromLocation(*location)
		if err != nil {
			return errors.Wrap(err, "(api.UpdateListing) getting coordinates from query")
		}

		// Use the validated location and coordinates for the update
		updateListingRequest.Location = location
		updateListingRequest.Coordinates = coordinates
	}

	_, err = listings.UpdateListing(
		s.db,
		listing,
		updateListingRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateListing) creating listing")
	}

	return json.NewEncoder(w).Encode(UpdateListingResponse{
		ListingId: listing.ID,
	})
}
