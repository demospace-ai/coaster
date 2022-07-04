package handlers

import (
	"encoding/json"
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

func CheckSession(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	var suggestedOrganizations []models.Organization
	var err error
	if !env.Auth.User.OrganizationID.Valid {
		var userEmailDomain = strings.Split(env.Auth.User.Email, "@")[1]
		suggestedOrganizations, err = organizations.LoadOrganizationsByEmailDomain(env.Db, userEmailDomain)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(CheckSessionResponse{
		User:                   *env.Auth.User,
		Organization:           env.Auth.Organization,
		SuggestedOrganizations: suggestedOrganizations,
	})
}
