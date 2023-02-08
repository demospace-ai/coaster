package api

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/connections"
	"fabra/internal/errors"
	"fmt"
	"net/http"
	"strconv"
)

type GetDatasetsRequest struct {
	ConnectionID int64 `json:"connection_id,omitempty"`
}

type GetDatasetsResponse struct {
	Datasets []string `json:"datasets"`
}

func (s ApiService) GetDatasets(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
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
	dataConnection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	datasets, err := s.queryService.GetDatasets(ctx, dataConnection)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetDatasetsResponse{
		Datasets: datasets,
	})
}
