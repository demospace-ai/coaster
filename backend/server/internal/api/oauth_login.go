package api

import (
	"net/http"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/oauth"
	"go.fabra.io/server/common/repositories/sessions"
	"go.fabra.io/server/common/repositories/users"
)

func (s ApiService) OAuthLogin(w http.ResponseWriter, r *http.Request) error {
	if !r.URL.Query().Has("state") {
		return errors.Newf("missing state from OAuth Login request URL: %s", r.URL.RequestURI())
	}

	if !r.URL.Query().Has("code") {
		return errors.Newf("missing code from OAuth Login request URL: %s", r.URL.RequestURI())
	}

	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	provider, err := oauth.ValidateState(state)
	if err != nil {
		return err
	}

	var externalUserInfo *oauth.ExternalUserInfo
	switch *provider {
	case oauth.OauthProviderGoogle:
		externalUserInfo, err = oauth.FetchGoogleInfo(code)
	case oauth.OauthProviderGithub:
		externalUserInfo, err = oauth.FetchGithubInfo(code)
	default:
		// TODO: throw error
	}
	if err != nil {
		return err
	}

	user, err := users.GetOrCreateForExternalInfo(s.db, externalUserInfo)
	if err != nil {
		return err
	}

	sessionToken, err := sessions.Create(s.db, user.ID)
	if err != nil {
		return err
	}

	auth.AddSessionCookie(w, *sessionToken)
	http.Redirect(w, r, getOauthSuccessRedirect(), http.StatusFound)

	return nil
}

func getOauthSuccessRedirect() string {
	if application.IsProd() {
		return "https://app.fabra.io"
	} else {
		return "http://localhost:3000"
	}
}
