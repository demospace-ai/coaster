package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/views"
)

type GetSyncsResponse struct {
	Syncs []views.Sync `json:"syncs"`
}

func (s ApiService) GetSyncs(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	syncs, err := syncs.LoadAllSyncs(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	var syncViews []views.Sync
	for _, sync := range syncs {
		// TODO: load sync field mappings
		syncViews = append(syncViews, views.ConvertSync(&sync, []models.SyncFieldMapping{}))
	}

	return json.NewEncoder(w).Encode(GetSyncsResponse{
		Syncs: syncViews,
	})
}
