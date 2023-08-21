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
	"go.fabra.io/server/common/repositories/listings"
)

type CreateListingRequest = input.Listing

type CreateListingResponse struct {
	ListingId int64 `json:"listing_id"`
}

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
	if createListingRequest.Location != nil {
		location, err = maps.GetLocationFromQuery(*createListingRequest.Location)
		if err != nil {
			return errors.Wrap(err, "(api.CreateListing) getting location from query")
		}

		coordinates, err = maps.GetCoordinatesFromLocation(*location)
		if err != nil {
			return errors.Wrap(err, "(api.CreateListing) getting coordinates from query")
		}
	}

	// TODO: pass other fields
	listing, err := listings.CreateListing(
		s.db,
		auth.User.ID,
		createListingRequest.Name,
		createListingRequest.Description,
		createListingRequest.Category,
		createListingRequest.Price,
		location,
		coordinates,
	)
	if err != nil {
		return errors.Wrap(err, "(api.CreateListing) creating listing")
	}

	return json.NewEncoder(w).Encode(CreateListingResponse{
		ListingId: listing.ID,
	})
}
