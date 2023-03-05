package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	sync_repository "go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/views"
)

type GetSyncsResponse struct {
	Syncs []views.Sync `json:"syncs"`
}

func (s ApiService) GetSyncs(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	syncs, err := sync_repository.LoadAllSyncs(s.db, auth.Organization.ID)
	if err != nil {
		return err
	}

	syncViews := []views.Sync{}
	for _, sync := range syncs {
		syncViews = append(syncViews, views.ConvertSync(&sync))
	}

	return json.NewEncoder(w).Encode(GetSyncsResponse{
		Syncs: syncViews,
	})
}
