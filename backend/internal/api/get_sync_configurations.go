package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/models"
	"fabra/internal/syncconfigurations"
	"net/http"
)

type GetSyncConfigurationsResponse struct {
	SyncConfigurations []models.SyncConfiguration `json:"sync_configurations"`
}

func (s ApiService) GetSyncConfigurations(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	syncConfigurations, err := syncconfigurations.LoadAllSyncConfigurations(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetSyncConfigurationsResponse{
		SyncConfigurations: syncConfigurations,
	})
}
