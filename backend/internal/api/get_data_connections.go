package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/models"
	"net/http"
)

type GetDataConnectionResponse struct {
	DataConnections []models.DataConnection `json:"data_connections"`
}

func (s ApiService) GetDataConnections(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	connections, err := dataconnections.LoadAllDataConnections(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetDataConnectionResponse{
		DataConnections: connections,
	})
}
