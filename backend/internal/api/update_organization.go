package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/dataconnections"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/organizations"
	"net/http"
)

type UpdateOrganizationRequest struct {
	ConnectionID *int64 `json:"connection_id,omitempty"`
	EventSetID   *int64 `json:"event_set_id,omitempty"`
}

type UpdateOrganizationResponse struct {
	Organization *models.Organization `json:"organization"`
}

func (s ApiService) UpdateOrganization(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	decoder := json.NewDecoder(r.Body)
	var updateOrganizationRequest UpdateOrganizationRequest
	err := decoder.Decode(&updateOrganizationRequest)
	if err != nil {
		return err
	}

	organization := auth.Organization

	if updateOrganizationRequest.ConnectionID != nil {
		_, err = dataconnections.LoadDataConnectionByID(s.db, auth.Organization.ID, *updateOrganizationRequest.ConnectionID)
		if err != nil {
			return err
		}

		organization, err = organizations.SetOrganizationDefaultDataConnection(s.db, organization, *updateOrganizationRequest.ConnectionID)
		if err != nil {
			return err
		}
	}

	if updateOrganizationRequest.EventSetID != nil {
		_, err = eventsets.LoadEventSetByID(s.db, auth.Organization.ID, *updateOrganizationRequest.EventSetID)
		if err != nil {
			return err
		}

		organization, err = organizations.SetOrganizationDefaultEventSet(s.db, organization, *updateOrganizationRequest.EventSetID)
		if err != nil {
			return err
		}
	}

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(UpdateOrganizationResponse{
		Organization: organization,
	})
}
