package api

import (
	"encoding/json"
	"errors"
	"fabra/internal/auth"
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

func (s ApiService) SetOrganization(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if !auth.IsAuthenticated {
		w.WriteHeader(http.StatusUnauthorized)
		return nil
	}

	decoder := json.NewDecoder(r.Body)
	var setOrganizationRequest SetOrganizationRequest
	err := decoder.Decode(&setOrganizationRequest)
	if err != nil {
		return err
	}

	if auth.User.OrganizationID.Valid {
		return errors.New("user already has an organization")
	}

	var userEmailDomain = strings.Split(auth.User.Email, "@")[1]

	if setOrganizationRequest.OrganizationName == nil && setOrganizationRequest.OrganizationID == nil {
		return errors.New("must specify either organization name or ID")
	}

	var organization *models.Organization
	if setOrganizationRequest.OrganizationName != nil {
		organization, err = organizations.Create(s.db, *setOrganizationRequest.OrganizationName, userEmailDomain)
		if err != nil {
			return err
		}

		_, err = users.SetOrganization(s.db, auth.User, organization.ID)
		if err != nil {
			return err
		}
	} else {
		organization, err = organizations.LoadOrganizationByID(s.db, *setOrganizationRequest.OrganizationID)
		if err != nil {
			return err
		}

		// TODO: additional validation if the user can join this organization beyond the domain matching
		if organization.EmailDomain != userEmailDomain {
			return errors.New("cannot join this organization")
		}

		_, err = users.SetOrganization(s.db, auth.User, organization.ID)
		if err != nil {
			return err
		}
	}

	return json.NewEncoder(w).Encode(SetOrganizationResponse{
		Organization: *organization,
	})
}
