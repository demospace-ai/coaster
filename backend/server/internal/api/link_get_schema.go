package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/query"
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
		return fmt.Errorf("missing source ID from GetSourceSchema request URL: %s", r.URL.RequestURI())
	}

	sourceId, err := strconv.ParseInt(strSourceId, 10, 64)
	if err != nil {
		return nil
	}

	namespace := r.URL.Query().Get("namespace")
	tableName := r.URL.Query().Get("tableName")
	customJoin := r.URL.Query().Get("customJoin")
	if (len(namespace) == 0 || len(tableName) == 0) && len(customJoin) == 0 {
		return fmt.Errorf("must provide both namespace and table name or custom join in GetSchema request: %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	source, err := sources.LoadSourceByID(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, sourceId)
	if err != nil {
		return err
	}

	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, source.ConnectionID)
	if err != nil {
		return err
	}

	var schema query.Schema
	if len(customJoin) > 0 {
		schema, err = s.getSchemaForCustomJoin(*connection, customJoin)
		if err != nil {
			return err
		}
	} else {
		schema, err = s.queryService.GetTableSchema(context.Background(), connection, namespace, tableName)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: schema,
	})
}
