package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/maps"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) SearchListings(w http.ResponseWriter, r *http.Request) error {
	locationQuery := r.URL.Query().Get("location")
	if len(locationQuery) == 0 {
		return errors.Newf("(api.SearchListings) missing location from SearchListings request URL: %s", r.URL.RequestURI())
	}

	var radius int64
	var err error
	strRadius := r.URL.Query().Get("radius")
	if len(strRadius) > 0 {
		radius, err = strconv.ParseInt(strRadius, 10, 64)
		if err != nil {
			return errors.Wrap(err, "(api.SearchListings) converting radius")
		}
	} else {
		radius = 100_000 // 100km default radius
	}

	location, err := maps.GetLocationFromQuery(locationQuery)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) getting location from query")
	}

	coordinates, err := maps.GetCoordinatesFromLocation(*location)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) getting coordinates from location")
	}

	listings, err := listings.LoadListingsWithinRadius(
		s.db,
		*coordinates,
		radius,
	)
	if err != nil {
		return errors.Wrap(err, "(api.SearchListings) loading listings")
	}

	return json.NewEncoder(w).Encode(views.ConvertListings(listings))
}
