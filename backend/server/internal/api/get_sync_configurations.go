package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/sync_configurations"
)

type GetSyncConfigurationsResponse struct {
	SyncConfigurations []models.SyncConfiguration `json:"sync_configurations"`
}

func (s ApiService) GetSyncConfigurations(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	syncConfigurations, err := sync_configurations.LoadAllSyncConfigurations(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetSyncConfigurationsResponse{
		SyncConfigurations: syncConfigurations,
	})
}
