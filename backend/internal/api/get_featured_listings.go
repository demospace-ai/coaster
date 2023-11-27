package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetFeaturedListings(w http.ResponseWriter, r *http.Request) error {
	categoryParam := r.URL.Query().Get("categories")
	durationParam := r.URL.Query().Get("durationMinutes")

	var listingDetails []listings.ListingDetails
	var err error
	if len(categoryParam) > 0 {
		listingDetails, err = s.loadFeaturedByCategory(categoryParam)
		if err != nil {
			return errors.Wrap(err, "(api.GetFeaturedListings) loading listings filtered by category")
		}
	} else if len(durationParam) > 0 {
		durationMinutes, err := strconv.ParseInt(durationParam, 10, 64)
		if err != nil {
			return errors.Wrap(err, "(api.GetFeaturedListings) parsing duration param")
		}

		listingDetails, err = listings.LoadByDuration(s.db, durationMinutes)
		if err != nil {
			return errors.Wrap(err, "(api.GetFeaturedListings) loading listings filtered by duration")
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
		return nil, errors.Wrap(err, "(api.loadFeaturedByCategory) unmarshalling categories")
	}

	if len(categories) == 0 {
		return listings.LoadFeatured(s.db)
	}

	return listings.LoadListingsByCategory(
		s.db,
		categories,
	)
}
