package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-playground/validator"
	"github.com/gorilla/mux"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/maps"
	"go.coaster.io/server/common/repositories/listings"
	"go.coaster.io/server/common/views"
)

type UpdateListingRequest = input.Listing

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

	// Make sure this user has ownership of this listing or is an admin
	listing, err := listings.LoadByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrapf(err, "(api.UpdateListing) loading listing %d for user %d", listingID, auth.User.ID)
	}

	if updateListingRequest.Location != nil {
		place, err := maps.GetPlaceFromQuery(*updateListingRequest.Location)
		if err != nil {
			return errors.Wrapf(err, "(api.UpdateListing) getting location from query for %s", *updateListingRequest.Location)
		}

		// Use the validated location and coordinates for the update
		updateListingRequest.Location = &place.Name
		updateListingRequest.Coordinates = &place.Coordinates
		updateListingRequest.PlaceID = &place.PlaceID

		placeDetails, err := maps.GetPlaceDetails(place.PlaceID, place.Coordinates)
		if err != nil {
			return errors.Wrap(err, "(api.UpdateListing) getting place details")
		}

		updateListingRequest.City = &placeDetails.City
		updateListingRequest.Region = &placeDetails.Region
		updateListingRequest.Country = &placeDetails.Country
		updateListingRequest.PostalCode = placeDetails.PostalCode
	}

	listingDetails, err := listings.UpdateListing(
		s.db,
		listing,
		updateListingRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateListing) updating listing")
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(*listingDetails))
}
