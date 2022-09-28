package api

import (
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/models"
	"fabra/internal/organizations"
	"net/http"
	"strings"
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
