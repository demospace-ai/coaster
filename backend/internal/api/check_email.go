package api

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/users"
)

type CheckEmailResponse struct {
	LoginMethod models.LoginMethod `json:"login_method"`
}

func (s ApiService) CheckEmail(w http.ResponseWriter, r *http.Request) error {
	if !r.URL.Query().Has("email") {
		return errors.Newf("(api.CheckEmail) missing email from CheckEmail request URL: %s", r.URL.RequestURI())
	}
	encodedEmail := r.URL.Query().Get("email")
	email, err := url.PathUnescape(encodedEmail)
	if err != nil {
		return errors.Wrap(err, "(api.CheckEmail) error decoding email")
	}

	email = strings.ToLower(email)
	user, err := users.LoadByEmail(s.db, email)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			return json.NewEncoder(w).Encode(CheckEmailResponse{
				LoginMethod: models.LoginMethodUndefined,
			})
		} else {
			return errors.Wrap(err, "(api.CheckEmail) error loading user by email")
		}
	}

	return json.NewEncoder(w).Encode(CheckEmailResponse{
		LoginMethod: user.LoginMethod,
	})
}
