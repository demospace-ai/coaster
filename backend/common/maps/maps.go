package maps

import (
	"context"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"googlemaps.github.io/maps"
)

const MAPS_API_KEY = "AIzaSyC8wQgUVXBQNvaPtqq60sPv-LiEIupZZWM"

type Place struct {
	FormattedAddress        string
	Coordinates geo.Point
	PlaceID     string
}

func GetPlaceFromQuery(query string) (*Place, error) {
	c, err := maps.NewClient(maps.WithAPIKey(MAPS_API_KEY))
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) creating maps client")
	}

	autocompleteRequest := &maps.PlaceAutocompleteRequest{
		Input: query,
	}
	autocompleteResponse, err := c.PlaceAutocomplete(context.TODO(), autocompleteRequest)
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) autocomplete request")
	}

	if len(autocompleteResponse.Predictions) == 0 {
		return nil, errors.Newf("(maps.GetPlaceFromQuery) no predictions for query: %s", query)
	}

	detailsRequest := &maps.PlaceDetailsRequest{
		PlaceID: autocompleteResponse.Predictions[0].PlaceID,
		Fields: []maps.PlaceDetailsFieldMask{
			maps.PlaceDetailsFieldMaskFormattedAddress,
			maps.PlaceDetailsFieldMaskGeometry,
		},
	}

	detailsResponse, err := c.PlaceDetails(context.TODO(), detailsRequest)
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) place details request")
	}

	return &Place{
		FormattedAddress: detailsResponse.FormattedAddress,
		Coordinates: geo.Point{
			Latitude:  detailsResponse.Geometry.Location.Lat,
			Longitude: detailsResponse.Geometry.Location.Lng,
		},
		PlaceID: detailsResponse.PlaceID,
	}, nil
}
