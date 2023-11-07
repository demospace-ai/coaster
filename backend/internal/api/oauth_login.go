package api

import (
	"fmt"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/oauth"
	"go.fabra.io/server/common/repositories/sessions"
	"go.fabra.io/server/common/repositories/users"
)

func (s ApiService) OAuthLogin(w http.ResponseWriter, r *http.Request) error {
	if !r.URL.Query().Has("state") {
		return errors.Newf("(api.OAuthLogin) missing state from OAuth Login request URL: %s", r.URL.RequestURI())
	}

	if !r.URL.Query().Has("code") {
		return errors.Newf("(api.OAuthLogin) missing code from OAuth Login request URL: %s", r.URL.RequestURI())
	}

	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	provider, origin, err := oauth.ValidateState(state)
	if err != nil {
		return errors.Wrap(err, "(api.OAuthLogin)")
	}

	var externalUserInfo *oauth.ExternalUserInfo
	switch *provider {
	case oauth.OauthProviderGoogle:
		externalUserInfo, err = oauth.FetchGoogleInfo(code)
	default:
		return errors.Newf("(api.OAuthLogin) unexpected provider %s", *provider)
	}
	if err != nil {
		return errors.Wrap(err, "(api.OAuthLogin)")
	}

	// separately check for existing user to bypass allowlist for domains
	user, err := users.LoadByExternalID(s.db, externalUserInfo.ExternalID)
	if err != nil && !errors.IsRecordNotFound(err) {
		return errors.Wrap(err, "(api.OAuthLogin)")
	}

	// try loading user by email— we trust OAuth to give us the correct email
	if user == nil {
		user, err = users.LoadByEmail(s.db, externalUserInfo.Email)
		if err != nil && !errors.IsRecordNotFound(err) {
			return errors.Wrap(err, "(api.OAuthLogin) checking for matching user by email")
		}
	}

	// no user exists yet, so if the domain is not allowed then redirect
	if user == nil {
		user, err = users.CreateUserForExternalInfo(s.db, externalUserInfo)
		if err != nil {
			return errors.Wrap(err, "(api.OAuthLogin) creating new user for OAuth login")
		}
	}

	sessionToken, err := sessions.Create(s.db, user.ID)
	if err != nil {
		return errors.Wrap(err, "(api.OAuthLogin) creating session token")
	}

	auth.AddSessionCookie(w, *sessionToken)
	http.Redirect(w, r, getOauthSuccessRedirect(*origin), http.StatusFound)

	return nil
}

func getOauthSuccessRedirect(origin string) string {
	return fmt.Sprintf("%s/oauth-callback", origin)
}
