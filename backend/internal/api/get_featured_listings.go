package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

type GetFeaturedListingsResponse struct {
	Listings []views.Listing `json:"listings"`
}

func (s ApiService) GetFeaturedListings(w http.ResponseWriter, r *http.Request) error {
	categoryParam := r.URL.Query().Get("categories")

	var listingDetails []listings.ListingDetails
	var err error
	if len(categoryParam) > 0 {
		listingDetails, err = s.loadFeaturedByCategory(categoryParam)
		if err != nil {
			return errors.Wrap(err, "(api.SearchListings) loading listings filtered by category")
		}
	} else {
		listingDetails, err = listings.LoadFeatured(s.db)
		if err != nil {
			return errors.Wrap(err, "(api.GetFeaturedListings) loading listings")
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertListings(listingDetails))
}

func (s ApiService) loadFeaturedByCategory(categoryParam string) ([]listings.ListingDetails, error) {
	var categories []models.ListingCategory
	err := json.Unmarshal([]byte(categoryParam), &categories)
	if err != nil {
		return nil, errors.Wrap(err, "(api.filterByCategory) unmarshalling categories")
	}

	if len(categories) == 0 {
		return listings.LoadFeatured(s.db)
	}

	return listings.LoadFeaturedListingsByCategory(
		s.db,
		categories,
	)
}
