package maps

import (
	"context"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"google.golang.org/api/option"
	"google.golang.org/api/places/v1"
	"googlemaps.github.io/maps"
)

const MAPS_API_KEY = "AIzaSyC8wQgUVXBQNvaPtqq60sPv-LiEIupZZWM"

type Place struct {
	Name        string
	Coordinates geo.Point
	PlaceID     string
}

type PlaceDetails struct {
	City       string
	Region     string
	Country    string
	PostalCode *string
}

func GetPlaceFromQuery(query string) (*Place, error) {
	c, err := maps.NewClient(maps.WithAPIKey(MAPS_API_KEY))
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) creating maps client")
	}

	autocompleteRequest := &maps.PlaceAutocompleteRequest{
		Input: query,
		Types: "locality|administrative_area_level_4|administrative_area_level_3|archipelago|natural_feature",
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
			maps.PlaceDetailsFieldMaskGeometry,
		},
	}

	detailsResponse, err := c.PlaceDetails(context.TODO(), detailsRequest)
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) place details request")
	}

	return &Place{
		Name: autocompleteResponse.Predictions[0].Description,
		Coordinates: geo.Point{
			Latitude:  detailsResponse.Geometry.Location.Lat,
			Longitude: detailsResponse.Geometry.Location.Lng,
		},
		PlaceID: autocompleteResponse.Predictions[0].PlaceID,
	}, nil
}

func GetPlaceDetails(placeId string, coordinates geo.Point) (*PlaceDetails, error) {
	service, err := places.NewService(context.TODO(), option.WithAPIKey(MAPS_API_KEY))
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) creating maps client")
	}

	c := places.NewPlacesService(service)

	detailsCall := c.Get("places/" + placeId)
	detailsCall.Fields("addressComponents")

	detailsResponse, err := detailsCall.Do()
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) place details request")
	}

	var city, region, country string
	var postalCode *string
	for _, component := range detailsResponse.AddressComponents {
		for _, componentType := range component.Types {
			switch componentType {
			case "locality":
				fallthrough
			case "administrative_area_level_3":
				fallthrough
			case "administrative_area_level_4":
				fallthrough
			case "archipelago":
				fallthrough
			case "natural_feature":
				city = component.ShortText
			case "administrative_area_level_1":
				region = component.ShortText
			case "country":
				country = component.ShortText
			case "postal_code":
				postalCode = &component.ShortText
			}
		}
	}

	// TODO: use fallback for other missing fields as well

	if postalCode == nil {
		postalCode, err = getPostalCodeFallback(service, coordinates)
		if err != nil {
			return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) getting postal code fallback")
		}
	}

	return &PlaceDetails{
		City:       city,
		Region:     region,
		Country:    country,
		PostalCode: postalCode,
	}, nil
}

func getPostalCodeFallback(service *places.Service, coordinates geo.Point) (*string, error) {
	c := places.NewPlacesService(service)

	nearbyPlaceRequest := &places.GoogleMapsPlacesV1SearchNearbyRequest{
		LanguageCode:   "en",
		IncludedTypes:  []string{"postal_code"},
		MaxResultCount: 1,
		LocationRestriction: &places.GoogleMapsPlacesV1SearchNearbyRequestLocationRestriction{
			Circle: &places.GoogleMapsPlacesV1Circle{
				Center: &places.GoogleTypeLatLng{
					Latitude:  coordinates.Latitude,
					Longitude: coordinates.Longitude,
				},
				Radius: 25000,
			},
		},
	}

	nearbyPlaceCall := c.SearchNearby(nearbyPlaceRequest)
	nearbyPlaceCall.Fields("places.displayName")

	nearbyPlaceResponse, err := nearbyPlaceCall.Do()
	if err != nil {
		return nil, errors.Wrap(err, "(maps.getPostalCodeFallback) nearby place request")
	}

	if len(nearbyPlaceResponse.Places) == 0 {
		return nil, nil
	}

	return &nearbyPlaceResponse.Places[0].DisplayName.Text, nil
}
