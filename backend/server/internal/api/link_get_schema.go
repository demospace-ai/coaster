package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/sources"
)

func (s ApiService) LinkGetSchema(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	strSourceId := r.URL.Query().Get("sourceID")
	if len(strSourceId) == 0 {
		return errors.Newf("missing source ID from LinkGetSchema request URL (LinkGetSchema): %s", r.URL.RequestURI())
	}

	sourceId, err := strconv.ParseInt(strSourceId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "LinkGetSchema")
	}

	namespace := r.URL.Query().Get("namespace")
	tableName := r.URL.Query().Get("tableName")
	customJoin := r.URL.Query().Get("customJoin")
	if (len(namespace) == 0 || len(tableName) == 0) && len(customJoin) == 0 {
		return errors.Newf("must provide both namespace and table name or custom join in GetSchema request (LinkGetSchema): %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	// Needed to ensure end customer ID encoded by the link token owns the source/connection
	source, err := sources.LoadSourceByID(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, sourceId)
	if err != nil {
		return errors.Wrap(err, "LinkGetSchema")
	}

	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, source.ConnectionID)
	if err != nil {
		return errors.Wrap(err, "LinkGetSchema")
	}

	var schema data.Schema
	if len(customJoin) > 0 {
		schema, err = s.getSchemaForCustomJoin(*connection, customJoin)
		if err != nil {
			return errors.Wrap(err, "LinkGetSchema")
		}
	} else {
		schema, err = s.queryService.GetSchema(context.Background(), connection, namespace, tableName)
		if err != nil {
			return errors.Wrap(err, "LinkGetSchema")
		}
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: schema,
	})
}
