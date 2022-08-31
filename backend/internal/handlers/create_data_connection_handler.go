package handlers

import (
	"encoding/json"
	"fabra/internal/errors"
	"fabra/internal/models"
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
}

type CreateDataConnectionResponse struct {
	DataConnection models.DataConnection
}

func CreateDataConnection(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	if env.Auth.Organization == nil {
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

	// TODO: load the encryption key

	// TODO: encrypt the credentials or password

	// TODO: create the data connection

	return json.NewEncoder(w).Encode(CreateDataConnectionResponse{
		// TODO: put data connection in response
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
