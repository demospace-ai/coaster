package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/organizations"
)

type CheckSessionResponse struct {
	User                   models.User           `json:"user"`
	Organization           *models.Organization  `json:"organization"`
	SuggestedOrganizations []models.Organization `json:"suggested_organizations"`
}

func (s ApiService) CheckSession(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	var suggestedOrganizations []models.Organization
	var err error
	if !auth.User.OrganizationID.Valid {
		var userEmailDomain = strings.Split(auth.User.Email, "@")[1]
		suggestedOrganizations, err = organizations.LoadOrganizationsByEmailDomain(s.db, userEmailDomain)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(CheckSessionResponse{
		User:                   *auth.User,
		Organization:           auth.Organization,
		SuggestedOrganizations: suggestedOrganizations,
	})
}
