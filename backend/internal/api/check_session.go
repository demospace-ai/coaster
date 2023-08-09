package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/views"
)

type CheckSessionResponse struct {
	User views.User `json:"user"`
}

func (s ApiService) CheckSession(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	return json.NewEncoder(w).Encode(CheckSessionResponse{
		User: views.ConvertUser(*auth.User),
	})
}
