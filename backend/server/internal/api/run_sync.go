package api

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/sync/temporal"
	"go.temporal.io/sdk/client"
)

func (s ApiService) RunSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	vars := mux.Vars(r)
	strSyncId, ok := vars["syncID"]
	if !ok {
		return errors.Newf("missing sync ID from RunSync request URL (RunSync): %s", r.URL.RequestURI())
	}

	syncId, err := strconv.ParseInt(strSyncId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "RunSync")
	}

	// check the sync belongs to the right organization
	sync, err := syncs.LoadSyncByID(s.db, auth.Organization.ID, syncId)
	if err != nil {
		return errors.Wrap(err, "RunSync")
	}

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		return errors.Wrap(err, "RunSync")
	}
	defer c.Close()

	ctx := context.TODO()
	scheduleClient := c.ScheduleClient()
	workflow := scheduleClient.GetHandle(ctx, sync.WorkflowID)
	// This will trigger the workflow execution if not already running, otherwise it will be a no-op.
	// This is due to the OverlapPolicy being set to SCHEDULE_OVERLAP_POLICY_SKIP by default.
	err = workflow.Trigger(ctx, client.ScheduleTriggerOptions{})
	if err != nil {
		return errors.Wrap(err, "RunSync")
	}

	return nil
}
