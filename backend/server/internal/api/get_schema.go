package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/connections"
)

type GetSchemaResponse struct {
	Schema data.Schema `json:"schema"`
}

func (s ApiService) GetSchema(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "GetSchema")
	}

	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return errors.Wrap(errors.Newf("missing connection ID from GetSchema request URL: %s", r.URL.RequestURI()), "GetSchema")
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "GetSchema")
	}

	namespace := r.URL.Query().Get("namespace")
	tableName := r.URL.Query().Get("tableName")
	customJoin := r.URL.Query().Get("customJoin")
	if (len(namespace) == 0 || len(tableName) == 0) && len(customJoin) == 0 {
		return errors.Wrap(errors.Newf("must provide both namespace and table name or custom join in GetSchema request: %s", r.URL.RequestURI()), "GetSchema")
	}

	// TODO: write test to make sure only authorized users can use the data connection
	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return errors.Wrap(err, "GetSchema")
	}

	var schema data.Schema
	if len(customJoin) > 0 {
		schema, err = s.getSchemaForCustomJoin(*connection, customJoin)
		if err != nil {
			return errors.Wrap(err, "GetSchema")
		}
	} else {
		schema, err = s.queryService.GetSchema(context.TODO(), connection, namespace, tableName)
		if err != nil {
			return errors.Wrap(err, "GetSchema")
		}
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: schema,
	})
}

func (s ApiService) getSchemaForCustomJoin(connection models.Connection, customJoin string) (data.Schema, error) {
	switch connection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		fallthrough
	case models.ConnectionTypeSnowflake:
		return nil, errors.Wrap(errors.NewBadRequest("custom join not supported"), "GetSchema")
	default:
		return nil, errors.Wrap(errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", connection.ConnectionType)), "GetSchema")
	}
}
