package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/connections"
)

type GetFieldValuesResponse struct {
	FieldValues []any `json:"field_values"`
}

func (s ApiService) GetFieldValues(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return errors.Newf("missing connection ID from GetPropertyValues request URL (GetFieldValues): %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return errors.Wrap(err, "GetFieldValues")
	}

	namespace := r.URL.Query().Get("namespace")
	if len(namespace) == 0 {
		return errors.Newf("missing namespace from GetFieldValues request URL (GetFieldValues): %s", r.URL.RequestURI())
	}

	tableName := r.URL.Query().Get("tableName")
	if len(tableName) == 0 {
		return errors.Newf("missing table name from GetFieldValues request URL (GetFieldValues): %s", r.URL.RequestURI())
	}

	fieldName := r.URL.Query().Get("fieldName")
	if len(fieldName) == 0 {
		return errors.Newf("missing field name from GetFieldValues request URL (GetFieldValues): %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return errors.Wrap(err, "GetFieldValues")
	}

	ctx := context.Background()
	fieldValues, err := s.queryService.GetFieldValues(ctx, connection, namespace, tableName, fieldName)
	if err != nil {
		return errors.Wrap(err, "GetFieldValues")
	}

	return json.NewEncoder(w).Encode(GetFieldValuesResponse{
		FieldValues: fieldValues,
	})
}
