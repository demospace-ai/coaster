package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/fabra-io/go-sdk/fabra"
)

type GetTablesResponse struct {
	Tables []string `json:"tables"`
}

func (s ApiService) GetTables(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

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

	datasetID := r.URL.Query().Get("datasetID")
	if len(datasetID) == 0 {
		return fmt.Errorf("missing dataset ID from GetTables request URL: %s", r.URL.RequestURI())
	}

	// TODO: write test to make sure only authorized users can use the data connection
	dataConnection, err := dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, connectionID)
	if err != nil {
		return err
	}

	bigQueryCredentialsString, err := s.cryptoService.DecryptDataConnectionCredentials(dataConnection.Credentials.String)
	if err != nil {
		return err
	}

	var bigQueryCredentials models.BigQueryCredentials
	err = json.Unmarshal([]byte(*bigQueryCredentialsString), &bigQueryCredentials)
	if err != nil {
		return err
	}

	warehouse := fabra.Warehouse{
		Type: fabra.WarehouseType(dataConnection.ConnectionType),
		Config: map[string]interface{}{
			fabra.GCPProjectID:   &bigQueryCredentials.ProjectID,
			fabra.GCPCredentials: bigQueryCredentialsString,
		},
	}
	client, err := fabra.NewAPIClient(warehouse)
	if err != nil {
		return err
	}

	tables, err := client.GetTables(datasetID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetTablesResponse{
		Tables: tables,
	})
}
