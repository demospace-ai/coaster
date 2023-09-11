package api

import (
	"net/http"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/oauth"
)

func (s ApiService) OAuthRedirect(w http.ResponseWriter, r *http.Request) error {
	if !r.URL.Query().Has("provider") {
		return errors.Newf("(api.OAuthRedirect) missing provider from OAuth Login request URL: %s", r.URL.RequestURI())
	}

	destination := r.URL.Query().Get("destination")
	strProvider := r.URL.Query().Get("provider")

	url, err := oauth.GetOauthRedirect(destination, strProvider)
	if err != nil {
		return errors.Wrap(err, "(api.OAuthRedirect)")
	}

	http.Redirect(w, r, *url, http.StatusFound)

	return nil
}
