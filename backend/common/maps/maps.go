package maps

import (
	"context"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"googlemaps.github.io/maps"
)

const MAPS_API_KEY = "AIzaSyC8wQgUVXBQNvaPtqq60sPv-LiEIupZZWM"

func GetLocationFromQuery(query string) (*string, error) {
	c, err := maps.NewClient(maps.WithAPIKey(MAPS_API_KEY))
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetLocationFromQuery) creating maps client")
	}

	autocompleteRequest := &maps.PlaceAutocompleteRequest{
		Input: query,
	}
	autocompleteResponse, err := c.PlaceAutocomplete(context.TODO(), autocompleteRequest)
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetLocationFromQuery) autocomplete request")
	}

	return &autocompleteResponse.Predictions[0].Description, nil
}

func GetCoordinatesFromLocation(location string) (*geo.Point, error) {
	c, err := maps.NewClient(maps.WithAPIKey(MAPS_API_KEY))
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetCoordinatesFromLocation) creating maps client")
	}

	geoRequest := &maps.GeocodingRequest{
		// TODO: right now we just use the first prediction, but we should do something better
		Address: location,
	}
	geoResponse, err := c.Geocode(context.TODO(), geoRequest)
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetCoordinatesFromLocation) geocode request")
	}

	coordinates := geo.Point{
		Latitude:  geoResponse[0].Geometry.Location.Lat,
		Longitude: geoResponse[0].Geometry.Location.Lng,
	}

	return &coordinates, nil
}
