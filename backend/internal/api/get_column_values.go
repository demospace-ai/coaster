package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/repositories/connections"
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

	namespace := r.URL.Query().Get("namespace")
	if len(namespace) == 0 {
		return fmt.Errorf("missing namespace from GetColumnValues request URL: %s", r.URL.RequestURI())
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
	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	// TODO: support getting property values for custom property group
	ctx := context.Background()
	columnValues, err := s.queryService.GetColumnValues(ctx, connection, namespace, tableName, columnName)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetColumnValuesResponse{
		ColumnValues: columnValues,
	})
}
