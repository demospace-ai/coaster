package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/organizations"
	"fmt"
	"net/http"
)

type CreateDataConnectionRequest struct {
	DisplayName    string                    `json:"display_name"`
	ConnectionType models.DataConnectionType `json:"connection_type"`
	Username       *string                   `json:"username,omitempty"`
	Password       *string                   `json:"password,omitempty"`
	Credentials    *string                   `json:"credentials,omitempty"`
	WarehouseName  *string                   `json:"warehouse_name,omitempty"`
	DatabaseName   *string                   `json:"database_name,omitempty"`
	Role           *string                   `json:"role,omitempty"`
	Account        *string                   `json:"account,omitempty"`
	SetDefault     bool                      `json:"set_default,omitempty"`
}

type CreateDataConnectionResponse struct {
	DataConnection models.DataConnection
}

func (s ApiService) CreateDataConnection(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createDataConnectionRequest CreateDataConnectionRequest
	err := decoder.Decode(&createDataConnectionRequest)
	if err != nil {
		return err
	}

	err = validateCreateDataConnectionRequest(createDataConnectionRequest)
	if err != nil {
		return err
	}

	var dataConnection *models.DataConnection
	var encryptedCredentials *string
	switch createDataConnectionRequest.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		encryptedCredentials, err = s.cryptoService.EncryptDataConnectionCredentials(*createDataConnectionRequest.Credentials)
		if err != nil {
			return err
		}
		dataConnection, err = dataconnections.CreateBigQueryDataConnection(
			s.db, auth.Organization.ID, createDataConnectionRequest.DisplayName, *encryptedCredentials,
		)
	case models.DataConnectionTypeSnowflake:
		encryptedCredentials, err = s.cryptoService.EncryptDataConnectionCredentials(*createDataConnectionRequest.Password)
		if err != nil {
			return err
		}
		dataConnection, err = dataconnections.CreateSnowflakeDataConnection(
			s.db, auth.Organization.ID,
			createDataConnectionRequest.DisplayName,
			*createDataConnectionRequest.Username,
			*encryptedCredentials,
			*createDataConnectionRequest.DatabaseName,
			*createDataConnectionRequest.WarehouseName,
			*createDataConnectionRequest.Role,
			*createDataConnectionRequest.Account,
		)
	}

	if err != nil {
		return err
	}

	if createDataConnectionRequest.SetDefault {
		organizations.SetOrganizationDefaultDataConnection(s.db, auth.Organization, dataConnection.ID)
	}

	return json.NewEncoder(w).Encode(CreateDataConnectionResponse{
		*dataConnection,
	})
}

func validateCreateDataConnectionRequest(request CreateDataConnectionRequest) error {
	switch request.ConnectionType {
	case models.DataConnectionTypeBigQuery:
		return validateCreateBigQueryConnection(request)
	case models.DataConnectionTypeSnowflake:
		return validateCreateSnowflakeConnection(request)
	default:
		return errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", request.ConnectionType))
	}
}

func validateCreateBigQueryConnection(request CreateDataConnectionRequest) error {
	if request.Credentials == nil {
		return errors.NewBadRequest("missing credentials")
	}

	var bigQueryCredentials models.BigQueryCredentials
	err := json.Unmarshal([]byte(*request.Credentials), &bigQueryCredentials)
	if err != nil {
		return err
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateCreateSnowflakeConnection(request CreateDataConnectionRequest) error {
	if request.Username == nil {
		return errors.NewBadRequest("missing username")
	}
	if request.Password == nil {
		return errors.NewBadRequest("missing password")
	}
	if request.WarehouseName == nil {
		return errors.NewBadRequest("missing warehouse name")
	}
	if request.DatabaseName == nil {
		return errors.NewBadRequest("missing database name")
	}
	if request.Role == nil {
		return errors.NewBadRequest("missing role")
	}
	if request.Account == nil {
		return errors.NewBadRequest("missing account")
	}

	return nil
}
