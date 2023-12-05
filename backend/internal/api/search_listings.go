package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/maps"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) SearchListings(w http.ResponseWriter, r *http.Request) error {
	queryParam := r.URL.Query().Get("query")
	locationParam := r.URL.Query().Get("location")
	radiusParam := r.URL.Query().Get("radius")
	categoryParam := r.URL.Query().Get("categories")

	var filteredListings []listings.ListingDetails
	var err error
	if len(queryParam) > 0 {
		filteredListings, err = listings.LoadListingsForQuery(s.db, queryParam)
		if err != nil {
			return errors.Wrap(err, "(api.SearchListings) loading listings by query")
		}
	} else if len(locationParam) > 0 {
		filteredListings, err = s.loadByLocation(locationParam, radiusParam)
		if err != nil {
			return errors.Wrap(err, "(api.SearchListings) loading listings filtered by location")
		}

		if len(categoryParam) > 0 {
			filteredListings, err = s.filterByCategory(filteredListings, categoryParam)
			if err != nil {
				return errors.Wrap(err, "(api.SearchListings) filtering listings by category")
			}
		}
	} else if len(categoryParam) > 0 {
		filteredListings, err = s.loadByCategory(categoryParam)
		if err != nil {
			return errors.Wrap(err, "(api.SearchListings) loading listings filtered by category")
		}
	} else {
		filteredListings, err = listings.LoadFeatured(s.db)
		if err != nil {
			return errors.Wrap(err, "(api.SearchListings) getting featured listings")
		}
	}

	startDateParam := r.URL.Query().Get("start_date")
	endDateParam := r.URL.Query().Get("end_date")
	filteredListings, err = s.filterByAvailability(filteredListings, startDateParam, endDateParam)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) getting listings filtered by availability")
	}

	return json.NewEncoder(w).Encode(views.ConvertListings(filteredListings))
}

func (s ApiService) loadByLocation(locationParam string, radiusParam string) ([]listings.ListingDetails, error) {
	var radius int64
	var err error
	if len(radiusParam) > 0 {
		radius, err = strconv.ParseInt(radiusParam, 10, 64)
		if err != nil {
			return nil, errors.Wrap(err, "(api.getListingsForLocation) converting radius")
		}
	} else {
		radius = 100_000 // 100km default radius
	}

	location, err := maps.GetLocationFromQuery(locationParam)
	if err != nil {
		return nil, errors.Wrap(err, "(api.getListingsForLocation) getting location from query")
	}

	coordinates, err := maps.GetCoordinatesFromLocation(*location)
	if err != nil {
		return nil, errors.Wrap(err, "(api.getListingsForLocation) getting coordinates from location")
	}

	return listings.LoadListingsWithinRadius(
		s.db,
		*coordinates,
		radius,
	)
}

func (s ApiService) loadByCategory(categoryParam string) ([]listings.ListingDetails, error) {
	var categories []models.ListingCategoryType
	err := json.Unmarshal([]byte(categoryParam), &categories)
	if err != nil {
		return nil, errors.Wrap(err, "(api.filterByCategory) unmarshalling categories")
	}

	if len(categories) == 0 {
		return listings.LoadFeatured(s.db)
	}

	return listings.LoadListingsByCategory(
		s.db,
		categories,
	)
}

func (s ApiService) filterByCategory(unfiltered []listings.ListingDetails, categoryParam string) ([]listings.ListingDetails, error) {
	var categories []models.ListingCategory
	err := json.Unmarshal([]byte(categoryParam), &categories)
	if err != nil {
		return nil, errors.Wrap(err, "(api.filterByCategory) unmarshalling categories")
	}

	if len(categories) == 0 {
		return unfiltered, nil
	}

	var filteredByCategory []listings.ListingDetails
	for _, listing := range unfiltered {
		for _, category := range categories {
			for _, listingCategory := range listing.Categories {
				if listingCategory == category {
					filteredByCategory = append(filteredByCategory, listing)
				}
			}
		}
	}

	return filteredByCategory, nil
}

func (s ApiService) filterByAvailability(unfiltered []listings.ListingDetails, startDateParam string, endDateParam string) ([]listings.ListingDetails, error) {
	var startDate, endDate time.Time
	var err error
	if len(startDateParam) == 0 {
		return unfiltered, nil
	} else {
		startDate, err = time.Parse(time.DateOnly, startDateParam)
		if err != nil {
			return nil, errors.Wrap(err, "(api.filterByAvailability) parsing start date")
		}
	}

	if len(endDateParam) == 0 {
		endDate = startDate
	} else {
		endDate, err = time.Parse(time.DateOnly, endDateParam)
		if err != nil {
			return nil, errors.Wrap(err, "(api.filterByAvailability) parsing end date")
		}
	}

	if startDate.Before(time.Now()) {
		return nil, errors.New("(api.filterByAvailability) start date must be in the future")
	}

	if endDate.Before(time.Now()) {
		return nil, errors.New("(api.filterByAvailability) end date must be in the future")
	}

	if endDate.Before(startDate) {
		return nil, errors.New("(api.filterByAvailability) end date must be after start date")
	}

	var filteredByAvailability []listings.ListingDetails
	for _, listing := range unfiltered {
		availabilityRules, err := availability_rules.LoadForListing(
			s.db,
			listing.ID,
		)
		if err != nil {
			return nil, errors.Wrap(err, "(api.filterByAvailability) loading availability for listing")
		}

		for _, rule := range availabilityRules {
			hasAvailability, err := rule.HasAvailabilityInRange(s.db, startDate, endDate, listing.Listing)
			if err != nil {
				return nil, errors.Wrap(err, "(api.filterByAvailability) checking availability for rule")
			}

			if hasAvailability {
				filteredByAvailability = append(filteredByAvailability, listing)
			}
		}
	}

	return filteredByAvailability, nil
}
