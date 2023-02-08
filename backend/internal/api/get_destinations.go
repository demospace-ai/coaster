package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/destinations"
	"fabra/internal/views"
	"net/http"
)

type GetDestinationsResponse struct {
	Destinations []views.Destination `json:"destinations"`
}

func (s ApiService) GetDestinations(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	destinations, err := destinations.LoadAllDestinations(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetDestinationsResponse{
		views.ConvertDestinationConnections(destinations),
	})
}
