package handlers

import (
	"encoding/json"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"net/http"
)

type GetEventSetsResponse struct {
	EventSets []models.EventSet `json:"event_sets"`
}

func GetEventSets(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	eventSets, err := eventsets.LoadAllEventSets(env.Db, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetEventSetsResponse{
		EventSets: eventSets,
	})
}
