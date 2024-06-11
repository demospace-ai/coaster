package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/maps"
	"go.coaster.io/server/common/models"
	"go.coaster.io/server/common/repositories/listings"
	"go.coaster.io/server/common/views"
)

type CreateListingRequest = input.Listing

func (s ApiService) CreateListing(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var createListingRequest CreateListingRequest
	err := decoder.Decode(&createListingRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateListing) decoding request")
	}

	validate := validator.New()
	err = validate.Struct(createListingRequest)
	if err != nil {
		return errors.Wrap(err, "(api.CreateListing) validating request")
	}

	if createListingRequest.Location != nil {
		place, err := maps.GetPlaceFromQuery(*createListingRequest.Location)
		if err != nil {
			return errors.Wrapf(err, "(api.CreateListing) getting location from query for %s", *createListingRequest.Location)
		}

		createListingRequest.Location = &place.Name
		createListingRequest.Coordinates = &place.Coordinates
		createListingRequest.PlaceID = &place.PlaceID

		placeDetails, err := maps.GetPlaceDetails(place.PlaceID, place.Coordinates)
		if err != nil {
			return errors.Wrapf(err, "(api.CreateListing) getting place details for %s", *createListingRequest.Location)
		}

		createListingRequest.City = &placeDetails.City
		createListingRequest.Region = &placeDetails.Region
		createListingRequest.Country = &placeDetails.Country
		createListingRequest.PostalCode = placeDetails.PostalCode
	}

	// TODO: pass other fields
	listing, err := listings.CreateListing(
		s.db,
		auth.User.ID,
		createListingRequest,
	)
	if err != nil {
		return errors.Wrap(err, "(api.CreateListing) creating listing")
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(listings.ListingDetails{
		Listing: *listing,
		Host:    auth.User,
		Images:  []models.ListingImage{},
	}))
}
