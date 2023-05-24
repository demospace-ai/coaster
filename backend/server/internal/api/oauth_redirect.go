package api

import (
	"net/http"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/oauth"
)

func (s ApiService) OAuthRedirect(w http.ResponseWriter, r *http.Request) error {
	if !r.URL.Query().Has("provider") {
		return errors.Newf("missing provider from OAuth Login request URL (OAuthRedirect): %s", r.URL.RequestURI())
	}

	strProvider := r.URL.Query().Get("provider")

	url, err := oauth.GetOauthRedirect(strProvider)
	if err != nil {
		return errors.Wrap(err, "OAuthRedirect")
	}

	http.Redirect(w, r, *url, http.StatusFound)

	return nil
}
