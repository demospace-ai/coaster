package maps

import (
	"context"

	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/geo"
	"go.coaster.io/server/common/secret"
	"google.golang.org/api/option"
	"google.golang.org/api/places/v1"
	"googlemaps.github.io/maps"
)

const MAPS_PROD_API_KEY_KEY = "projects/454026596701/secrets/maps-api-key/versions/latest"
const MAPS_DEV_API_KEY_KEY = "projects/86315250181/secrets/maps-dev-api-key/versions/latest"


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

func getMapsApiKeyKey() string {
	if application.IsProd() {
		return MAPS_PROD_API_KEY_KEY
	} else {
		return MAPS_DEV_API_KEY_KEY
	}
}

func GetPlaceFromQuery(query string) (*Place, error) {
	mapsApiKey, err := secret.FetchSecret(context.TODO(), getMapsApiKeyKey())
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) fetching secret")
	}
	
	c, err := maps.NewClient(maps.WithAPIKey(*mapsApiKey))
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
	detailsCall.LanguageCode("en")

	detailsResponse, err := detailsCall.Do()
	if err != nil {
		return nil, errors.Wrap(err, "(maps.GetPlaceFromQuery) place details request")
	}

	addressComponentMap := getAddressComponentMap(detailsResponse.AddressComponents)

	city := addressComponentMap["locality"]
	if city == "" {
		city = addressComponentMap["archipelago"]
	}
	if city == "" {
		city = addressComponentMap["natural_feature"]
	}
	if city == "" {
		city = addressComponentMap["administrative_area_level_3"]
	}
	if city == "" {
		city = addressComponentMap["administrative_area_level_4"]
	}

	region := addressComponentMap["administrative_area_level_1"]

	country := addressComponentMap["country"]

	// TODO: use fallback for other missing fields as well
	var postalCode *string
	postalCodeComponent, ok := addressComponentMap["postal_code"]
	if ok {
		postalCode = &postalCodeComponent
	} else {
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

func getAddressComponentMap(addressComponents []*places.GoogleMapsPlacesV1PlaceAddressComponent) map[string]string {
	componentMap := make(map[string]string)

	for _, component := range addressComponents {
		for _, componentType := range component.Types {
			componentMap[componentType] = component.ShortText
		}
	}

	return componentMap
}
