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
)

func (s ApiService) CancelSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "(api.CancelSync)")
	}

	vars := mux.Vars(r)
	strSyncId, ok := vars["syncID"]
	if !ok {
		return errors.Wrap(errors.NewBadRequestf("missing sync ID from RunSync request URL: %s", r.URL.RequestURI()), "(api.CancelSync)")
	}

	syncId, err := strconv.ParseInt(strSyncId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.CancelSync)")
	}

	// check the sync belongs to the right organization
	sync, err := syncs.LoadSyncByID(s.db, auth.Organization.ID, syncId)
	if err != nil {
		return errors.Wrap(err, "(api.CancelSync)")
	}

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		return errors.Wrap(err, "(api.CancelSync)")
	}
	defer c.Close()

	ctx := context.TODO()
	err = c.CancelWorkflow(
		ctx,
		sync.WorkflowID,
		"", // Empty RunID will result in the currently running workflow to be cancelled
	)
	if err != nil {
		return errors.Wrap(err, "CancelSync")
	}

	return nil
}
