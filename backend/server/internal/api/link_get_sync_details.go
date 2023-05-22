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

func (s ApiService) LinkGetSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "LinkGetSync")
	}

	if auth.LinkToken == nil {
		return errors.Wrap(errors.NewBadRequest("must send link token"), "LinkGetSync")
	}

	timezone := timeutils.GetTimezoneHeader(r)

	vars := mux.Vars(r)
	strSyncId, ok := vars["syncID"]
	if !ok {
		return errors.Wrap(errors.Newf("missing sync ID from GetSyncDetails request URL: %s", r.URL.RequestURI()), "LinkGetSync")
	}

	syncId, err := strconv.ParseInt(strSyncId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "LinkGetSync")
	}

	// check the sync belongs to the right organization and customer
	sync, err := syncs.LoadSyncByIDAndCustomer(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, syncId)
	if err != nil {
		return errors.Wrap(err, "LinkGetSync")
	}

	syncRuns, err := sync_runs.LoadAllRunsForSync(s.db, auth.Organization.ID, sync.ID)
	if err != nil {
		return errors.Wrap(err, "LinkGetSync")
	}

	syncRunsView, err := views.ConvertSyncRuns(syncRuns, timezone)
	if err != nil {
		return errors.Wrap(err, "LinkGetSync")
	}

	return json.NewEncoder(w).Encode(GetSyncResponse{
		Sync:        views.ConvertSync(sync),
		NextRunTime: "",
		SyncRuns:    syncRunsView,
	})
}
