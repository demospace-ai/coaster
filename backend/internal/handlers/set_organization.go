package handlers

import (
	"encoding/json"
	"errors"
	"fabra/internal/models"
	"fabra/internal/organizations"
	"fabra/internal/users"
	"net/http"
	"strings"
)

type SetOrganizationRequest struct {
	OrganizationName *string `json:"organization_name,omitempty"`
	OrganizationID   *int64  `json:"organization_id,omitempty"`
}

type SetOrganizationResponse struct {
	Organization models.Organization `json:"organization"`
}

func SetOrganization(env Env, w http.ResponseWriter, r *http.Request) error {
	if !env.Auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var setOrganizationRequest SetOrganizationRequest
	err := decoder.Decode(&setOrganizationRequest)
	if err != nil {
		return err
	}

	if env.Auth.User.OrganizationID.Valid {
		return errors.New("user already has an organization")
	}

	var userEmailDomain = strings.Split(env.Auth.User.Email, "@")[1]

	if setOrganizationRequest.OrganizationName == nil && setOrganizationRequest.OrganizationID == nil {
		return errors.New("must specify either organization name or ID")
	}

	var organization *models.Organization
	if setOrganizationRequest.OrganizationName != nil {
		organization, err = organizations.Create(env.Db, *setOrganizationRequest.OrganizationName, userEmailDomain)
		if err != nil {
			return err
		}

		_, err = users.SetOrganization(env.Db, env.Auth.User, organization.ID)
		if err != nil {
			return err
		}
	} else {
		organization, err = organizations.LoadOrganizationByID(env.Db, *setOrganizationRequest.OrganizationID)
		if err != nil {
			return err
		}

		// TODO: additional validation if the user can join this organization beyond the domain matching
		if organization.EmailDomain != userEmailDomain {
			return errors.New("cannot join this organization")
		}

		_, err = users.SetOrganization(env.Db, env.Auth.User, organization.ID)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(SetOrganizationResponse{
		Organization: *organization,
	})
}
