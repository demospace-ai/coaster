package api

import (
	"net/http"

	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/oauth"
)

var ALLOWED_ORIGINS = []string{"https://www.trycoaster.com", "https://supplier.trycoaster.com", "http://localhost:3000", "http://localhost:3030"}

func (s ApiService) OAuthRedirect(w http.ResponseWriter, r *http.Request) error {
	if !r.URL.Query().Has("provider") {
		return errors.Wrapf(errors.BadRequest, "(api.OAuthRedirect) missing provider from OAuth Login request URL: %s", r.URL.RequestURI())
	}

	provider := r.URL.Query().Get("provider")
	origin := r.URL.Query().Get("origin")
	if !isOriginAllowed(origin) {
		return errors.Wrapf(errors.BadRequest, "(api.OAuthRedirect) origin not allowed: %s", origin)
	}

	url, err := oauth.GetOauthRedirect(origin, provider)
	if err != nil {
		return errors.Wrap(err, "(api.OAuthRedirect) getting redirect link")
	}

	http.Redirect(w, r, *url, http.StatusFound)

	return nil
}

func isOriginAllowed(origin string) bool {
	for _, allowedOrigin := range ALLOWED_ORIGINS {
		if origin == allowedOrigin {
			return true
		}
	}

	return false
}
