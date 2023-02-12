package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/connections"
)

type GetNamespacesRequest struct {
	ConnectionID int64 `json:"connection_id,omitempty"`
}

type GetNamespacesResponse struct {
	Namespaces []string `json:"namespaces"`
}

func (s ApiService) GetNamespaces(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	ctx := context.Background()
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	strConnectionID := r.URL.Query().Get("connectionID")
	if len(strConnectionID) == 0 {
		return fmt.Errorf("missing connection ID from GetDatasets request URL: %s", r.URL.RequestURI())
	}

	connectionID, err := strconv.ParseInt(strConnectionID, 10, 64)
	if err != nil {
		return nil
	}

	// TODO: write test to make sure only authorized users can use the data connection
	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	namespaces, err := s.queryService.GetNamespaces(ctx, connection)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetNamespacesResponse{
		Namespaces: namespaces,
	})
}
