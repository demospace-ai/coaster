package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/sources"
)

func (s ApiService) LinkGetTables(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "LinkGetTables")
	}

	if auth.LinkToken == nil {
		return errors.Wrap(errors.NewBadRequest("must send link token"), "LinkGetTables")
	}

	strSourceId := r.URL.Query().Get("sourceID")
	if len(strSourceId) == 0 {
		return errors.Wrap(errors.Newf("missing source ID from LinkGetTables request URL: %s", r.URL.RequestURI()), "LinkGetTables")
	}

	sourceId, err := strconv.ParseInt(strSourceId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "LinkGetTables")
	}

	namespace := r.URL.Query().Get("namespace")
	if len(namespace) == 0 {
		return errors.Wrap(errors.Newf("missing namespace from LinkGetTables request URL: %s", r.URL.RequestURI()), "LinkGetTables")
	}

	// TODO: write test to make sure only authorized users can use the data connection
	// Needed to ensure end customer ID encoded by the link token owns the source/connection
	source, err := sources.LoadSourceByID(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, sourceId)
	if err != nil {
		return errors.Wrap(err, "LinkGetTables")
	}

	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, source.ConnectionID)
	if err != nil {
		return errors.Wrap(err, "LinkGetTables")
	}

	tables, err := s.queryService.GetTables(context.TODO(), connection, namespace)
	if err != nil {
		return errors.Wrap(err, "LinkGetTables")
	}

	return json.NewEncoder(w).Encode(GetTablesResponse{
		Tables: tables,
	})
}
