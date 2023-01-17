package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
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
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	client, err := s.NewBigQueryClient(*dataConnection)
	if err != nil {
		return err
	}

	datasets, err := client.GetDatasets()
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetDatasetsResponse{
		Datasets: datasets,
	})
}
