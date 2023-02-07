package api

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/query"
	"fmt"
	"net/http"
	"strconv"
)

type GetColumnValuesResponse struct {
	ColumnValues []query.Value `json:"column_values"`
}

func (s ApiService) GetColumnValues(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetPropertyValues request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	datasetName := r.URL.Query().Get("datasetName")
	if len(datasetName) == 0 {
		return fmt.Errorf("missing dataset name from GetColumnValues request URL: %s", r.URL.RequestURI())
	}

	tableName := r.URL.Query().Get("tableName")
	if len(tableName) == 0 {
		return fmt.Errorf("missing table name from GetColumnValues request URL: %s", r.URL.RequestURI())
	}

	columnName := r.URL.Query().Get("columnName")
	if len(columnName) == 0 {
		return fmt.Errorf("missing column name from GetColumnValues request URL: %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	// TODO: support getting property values for custom property group
	ctx := context.Background()
	columnValues, err := s.queryService.GetColumnValues(ctx, dataConnection, datasetName, tableName, columnName)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetColumnValuesResponse{
		ColumnValues: columnValues,
	})
}
