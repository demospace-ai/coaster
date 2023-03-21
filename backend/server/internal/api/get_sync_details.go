package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/sync_runs"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/timeutils"
	"go.fabra.io/server/common/views"
)

type GetSyncDetailsResponse struct {
	Sync        views.Sync      `json:"sync"`
	NextRunTime string          `json:"next_run_time"`
	SyncRuns    []views.SyncRun `json:"sync_runs"`
}

func (s ApiService) GetSyncDetails(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	timezone := timeutils.GetTimezoneHeader(r)

	vars := mux.Vars(r)
	strSyncId, ok := vars["syncID"]
	if !ok {
		return errors.Newf("missing sync ID from GetSyncDetails request URL: %s", r.URL.RequestURI())
	}

	syncId, err := strconv.ParseInt(strSyncId, 10, 64)
	if err != nil {
		return err
	}

	// check the sync belongs to the right organization
	sync, err := syncs.LoadSyncByID(s.db, auth.Organization.ID, syncId)
	if err != nil {
		return err
	}

	syncRuns, err := sync_runs.LoadAllRunsForSync(s.db, auth.Organization.ID, sync.ID)
	if err != nil {
		return err
	}

	syncRunsView, err := views.ConvertSyncRuns(syncRuns, timezone)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetSyncDetailsResponse{
		Sync:        views.ConvertSync(sync),
		NextRunTime: "",
		SyncRuns:    syncRunsView,
	})
}
