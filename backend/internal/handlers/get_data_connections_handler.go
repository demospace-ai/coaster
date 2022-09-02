package handlers

import (
	"encoding/json"
	"fabra/internal/dataconnections"
	"fabra/internal/models"
	"net/http"
)

type GetDataConnectionResponse struct {
	DataConnections []models.DataConnection `json:"data_connection"`
}

func GetDataConnections(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	connections, err := dataconnections.GetDataConnections(env.Db, env.Auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetDataConnectionResponse{
		DataConnections: connections,
	})
}
