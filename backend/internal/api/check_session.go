package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/intercom"
	"go.fabra.io/server/common/views"
)

type CheckSessionResponse struct {
	User views.User `json:"user"`
}

func (s ApiService) CheckSession(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	intercomHash, err := intercom.GenerateIntercomHash(*auth.User)
	if err != nil {
		return errors.Wrap(err, "(api.CheckSession)")
	}

	return json.NewEncoder(w).Encode(CheckSessionResponse{
		User: views.ConvertUser(*auth.User, *intercomHash),
	})
}
