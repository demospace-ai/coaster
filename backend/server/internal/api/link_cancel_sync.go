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

func (s ApiService) LinkCancelSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	vars := mux.Vars(r)
	strSyncId, ok := vars["syncID"]
	if !ok {
		return errors.Newf("missing sync ID from RunSync request URL: %s", r.URL.RequestURI())
	}

	syncId, err := strconv.ParseInt(strSyncId, 10, 64)
	if err != nil {
		return err
	}

	// check the sync belongs to the right organization and customer
	sync, err := syncs.LoadSyncByIDAndCustomer(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, syncId)
	if err != nil {
		return err
	}

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		return err
	}
	defer c.Close()

	ctx := context.TODO()
	err = c.CancelWorkflow(
		ctx,
		sync.WorkflowID,
		"",
	)
	if err != nil {
		return err
	}

	return nil
}
