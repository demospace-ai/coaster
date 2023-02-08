package api

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/connections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/query"
	"fmt"
	"net/http"
	"strconv"
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

	datasetID := r.URL.Query().Get("datasetID")
	tableName := r.URL.Query().Get("tableName")
	customJoin := r.URL.Query().Get("customJoin")
	if (len(datasetID) == 0 || len(tableName) == 0) && len(customJoin) == 0 {
		return fmt.Errorf("must provide both dataset name and table name or custom join in GetSchema request: %s", r.URL.RequestURI())
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
		schema, err = s.getSchemaForTable(*connection, datasetID, tableName)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(GetSchemaResponse{
		Schema: schema,
	})
}

func (s ApiService) getSchemaForTable(connection models.Connection, datasetID string, tableName string) (query.Schema, error) {
	switch connection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return s.getBigQuerySchemaForTable(connection, datasetID, tableName)
	case models.ConnectionTypeSnowflake:
		return s.getSnowflakeSchemaForTable(connection, datasetID, tableName)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", connection.ConnectionType))
	}
}

func (s ApiService) getSchemaForCustomJoin(connection models.Connection, customJoin string) (query.Schema, error) {
	switch connection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return s.getBigQuerySchemaForCustom(connection, customJoin)
	case models.ConnectionTypeSnowflake:
		return s.getSnowflakeSchemaForCustom(connection, customJoin)
	default:
		return nil, errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", connection.ConnectionType))
	}
}

func (s ApiService) getBigQuerySchemaForCustom(connection models.Connection, customJoin string) (query.Schema, error) {
	ctx := context.Background()
	result, err := s.queryService.RunQuery(ctx, &connection, customJoin)
	if err != nil {
		return nil, err
	}

	return result.Schema, nil
}

func (s ApiService) getBigQuerySchemaForTable(connection models.Connection, datasetID string, tableName string) (query.Schema, error) {
	ctx := context.Background()
	return s.queryService.GetTableSchema(ctx, &connection, datasetID, tableName)
}

func (s ApiService) getSnowflakeSchemaForTable(connection models.Connection, datasetID string, tableName string) (query.Schema, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}

func (s ApiService) getSnowflakeSchemaForCustom(connection models.Connection, customJoin string) (query.Schema, error) {
	// TODO: implement
	return nil, errors.NewBadRequest("snowflake not supported")
}
