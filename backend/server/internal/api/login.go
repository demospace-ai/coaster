package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/organizations"
	"go.fabra.io/server/common/repositories/sessions"
	"go.fabra.io/server/common/repositories/users"
	"go.fabra.io/server/common/repositories/verifications"

	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

const CLIENT_ID = "932264813910-egpk1omo3v2cedd89k8go851uko6djpa.apps.googleusercontent.com"

type EmailAuthentication struct {
	Email          string `json:"email"`
	ValidationCode string `json:"validation_code"`
}

type LoginRequest struct {
	IdToken             *string              `json:"id_token,omitempty"`
	EmailAuthentication *EmailAuthentication `json:"email_authentication,omitempty"`
}

type LoginResponse struct {
	User                   models.User           `json:"user"`
	Organization           *models.Organization  `json:"organization"`
	SuggestedOrganizations []models.Organization `json:"suggested_organizations"`
}

func (s ApiService) Login(w http.ResponseWriter, r *http.Request) error {
	// Login is not an authenticated endpoint, but we can still short-circuit if the user is already logged-in
	authResult, err := s.authService.GetAuthentication(r)
	if err != nil {
		return err
	}

	if authResult.IsAuthenticated {
		return json.NewEncoder(w).Encode(LoginResponse{
			User:         *authResult.User,
			Organization: authResult.Organization,
		})
	}

	decoder := json.NewDecoder(r.Body)
	var loginRequest LoginRequest
	err = decoder.Decode(&loginRequest)
	if err != nil {
		return err
	}

	ctx := r.Context()

	var token *string
	var user *models.User
	switch {
	case loginRequest.IdToken != nil:
		user, token, err = googleLogin(ctx, s.db, *loginRequest.IdToken)
	case loginRequest.EmailAuthentication != nil:
		// TODO: need to collect names when creating an account via email
		user, token, err = emailLogin(s.db, *loginRequest.EmailAuthentication)
	default:
		return errors.BadRequest
	}

	if err != nil {
		return err
	}

	var organization *models.Organization
	var suggestedOrganizations []models.Organization
	if user.OrganizationID.Valid {
		organization, err = organizations.LoadOrganizationByID(s.db, user.OrganizationID.Int64)
		if err != nil {
			return err
		}
	} else {
		var userEmailDomain = strings.Split(user.Email, "@")[1]
		if userEmailDomain != "gmail.com" && userEmailDomain != "outlook.com" && userEmailDomain != "icloud.com" && userEmailDomain != "yahoo.com" && userEmailDomain != "aol.com" && userEmailDomain != "hotmail.com" {
			suggestedOrganizations, err = organizations.LoadOrganizationsByEmailDomain(s.db, userEmailDomain)
			if err != nil {
				return err
			}
		}
	}

	auth.AddSessionCookie(w, *token)
	return json.NewEncoder(w).Encode(LoginResponse{
		User:                   *user,
		Organization:           organization,
		SuggestedOrganizations: suggestedOrganizations,
	})
}

func validateAndParseIdToken(ctx context.Context, idToken string) (*users.ExternalUserInfo, error) {
	validator, err := idtoken.NewValidator(ctx)
	if err != nil {
		return nil, err
	}

	payload, err := validator.Validate(ctx, idToken, CLIENT_ID)
	if err != nil {
		return nil, err
	}

	return &users.ExternalUserInfo{
		ExternalID: payload.Subject,
		Email:      payload.Claims["email"].(string),
		FirstName:  payload.Claims["given_name"].(string),
		LastName:   payload.Claims["family_name"].(string),
	}, nil
}

func googleLogin(ctx context.Context, db *gorm.DB, idToken string) (*models.User, *string, error) {
	externalUserInfo, err := validateAndParseIdToken(ctx, idToken)
	if err != nil {
		return nil, nil, err
	}

	user, err := users.GetOrCreateForExternalInfo(db, externalUserInfo)
	if err != nil {
		return nil, nil, err
	}

	token, err := sessions.Create(db, user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, token, nil
}

func emailLogin(db *gorm.DB, emailAuthentication EmailAuthentication) (*models.User, *string, error) {
	// the user is created when the validation code is sent
	user, err := users.LoadByEmail(db, emailAuthentication.Email)
	if err != nil {
		return nil, nil, err
	}

	_, err = verifications.VerifyCode(db, emailAuthentication.ValidationCode, user.ID)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			return nil, nil, errors.Unauthorized
		}

		return nil, nil, err
	}

	token, err := sessions.Create(db, user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, token, nil
}
