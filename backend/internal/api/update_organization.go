package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/models"
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

	// TODO: mask database ID
	return json.NewEncoder(w).Encode(UpdateOrganizationResponse{
		Organization: organization,
	})
}
