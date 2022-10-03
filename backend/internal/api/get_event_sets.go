package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"net/http"
)

type GetEventSetsResponse struct {
	EventSets []models.EventSet `json:"event_sets"`
}

func (s ApiService) GetEventSets(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	eventSets, err := eventsets.LoadAllEventSets(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetEventSetsResponse{
		EventSets: eventSets,
	})
}
