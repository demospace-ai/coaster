package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/maps"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
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

	var location *string
	var coordinates *geo.Point
	var placeId *string
	if createListingRequest.Location != nil {
		place, err := maps.GetPlaceFromQuery(*createListingRequest.Location)
		if err != nil {
			return errors.Wrap(err, "(api.CreateListing) getting location from query")
		}

		location = &place.Name
		coordinates = &place.Coordinates
		placeId = &place.PlaceID
	}

	// TODO: pass other fields
	listing, err := listings.CreateListing(
		s.db,
		auth.User.ID,
		createListingRequest.Name,
		createListingRequest.Description,
		createListingRequest.Categories,
		createListingRequest.Price,
		location,
		coordinates,
		placeId,
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
