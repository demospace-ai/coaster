package handlers

import (
	"context"
	"encoding/json"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/sessions"
	"fabra/internal/user_identities"
	"fabra/internal/users"
	"fabra/internal/verifications"
	"net/http"

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
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func Login(env Env, w http.ResponseWriter, r *http.Request) error {
	if env.Auth.IsAuthenticated {
		userIdentity, err := user_identities.LoadByUserID(env.Db, env.Auth.Session.UserID)
		if err != nil {
			return err
		}

		return json.NewEncoder(w).Encode(LoginResponse{
			FirstName: userIdentity.FirstName,
			LastName:  userIdentity.LastName,
		})
	}

	decoder := json.NewDecoder(r.Body)
	var loginRequest LoginRequest
	err := decoder.Decode(&loginRequest)
	if err != nil {
		return err
	}

	ctx := r.Context()

	var token *string
	switch {
	case loginRequest.IdToken != nil:
		_, token, err = googleLogin(ctx, env.Db, *loginRequest.IdToken)
	case loginRequest.EmailAuthentication != nil:
		// TODO: need to collect names when creating an account via email
		_, token, err = emailLogin(env.Db, *loginRequest.EmailAuthentication)
	default:
		return errors.BadRequest
	}

	if err != nil {
		return err
	}

	auth.AddSessionCookie(w, *token)
	return json.NewEncoder(w).Encode(LoginResponse{})
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
		FirstName:  payload.Claims["family_name"].(string),
		LastName:   payload.Claims["given_name"].(string),
	}, nil
}

func googleLogin(ctx context.Context, db *gorm.DB, idToken string) (*models.UserIdentity, *string, error) {
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

	return nil, token, nil
}

func emailLogin(db *gorm.DB, emailAuthentication EmailAuthentication) (*models.UserIdentity, *string, error) {
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

	return nil, token, nil
}
