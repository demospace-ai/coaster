package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/repositories/connections"
)

type GetSchemaResponse struct {
	Schema query.Schema `json:"schema"`
}

func (s ApiService) GetSchema(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetSchema request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
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
	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, connectionID)
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
		schema, err = s.getSchemaForTable(*connection, namespace, tableName)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: schema,
	})
}

func (s ApiService) getSchemaForTable(connection models.Connection, namespace string, tableName string) (query.Schema, error) {
	switch connection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		fallthrough
	case models.ConnectionTypeSnowflake:
		return s.queryService.GetTableSchema(context.Background(), &connection, namespace, tableName)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", connection.ConnectionType))
	}
}

func (s ApiService) getSchemaForCustomJoin(connection models.Connection, customJoin string) (query.Schema, error) {
	switch connection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		fallthrough
	case models.ConnectionTypeSnowflake:
		return nil, errors.NewBadRequest("custom join not supported")
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", connection.ConnectionType))
	}
}
