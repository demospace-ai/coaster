package api

import (
	"context"
	"fmt"
	"log"
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
		return fmt.Errorf("missing sync ID from RunSync request URL: %s", r.URL.RequestURI())
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

	// TODO: do this on a schedule
	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		log.Fatalln("unable to create Temporal client", err)
	}
	defer c.Close()

	ctx := context.TODO()
	_, err = c.ExecuteWorkflow(
		ctx,
		client.StartWorkflowOptions{
			TaskQueue:    temporal.SyncTaskQueue,
			CronSchedule: "0 0 * * *",
		},
		temporal.SyncWorkflow,
		temporal.SyncInput{SyncID: sync.ID, OrganizationID: auth.Organization.ID},
	)
	if err != nil {
		return err
	}

	return nil
}
