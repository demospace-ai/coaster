package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/maps"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) SearchListings(w http.ResponseWriter, r *http.Request) error {
	locationParam := r.URL.Query().Get("location")
	radiusParam := r.URL.Query().Get("radius")
	filteredByLocation, err := s.filterByLocation(locationParam, radiusParam)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) getting listings filtered by location")
	}

	startDateParam := r.URL.Query().Get("start_date")
	endDateParam := r.URL.Query().Get("end_date")
	filteredListings, err := s.filterByAvailability(filteredByLocation, startDateParam, endDateParam)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) getting listings filtered by availability")
	}

	return json.NewEncoder(w).Encode(views.ConvertListings(filteredListings))
}

func (s ApiService) filterByLocation(locationParam string, radiusParam string) ([]listings.ListingDetails, error) {
	if len(locationParam) == 0 {
		return listings.LoadFeatured(s.db)
	} else {
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
			hasAvailability, err := rule.HasAvailabilityInRange(s.db, startDate, endDate)
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
