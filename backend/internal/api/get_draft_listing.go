package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/repositories/users"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetDraftListing(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	listing, err := listings.GetDraftListing(
		s.db,
		auth.User.ID,
	)
	if err != nil {
		return errors.Wrap(err, "(api.GetNewListing) getting new listing")
	}

	if !auth.User.IsHost {
		err = users.SetIsHost(s.db, auth.User.ID, true)
		if err != nil {
			return errors.Wrap(err, "(api.GetNewListing) setting user as host")
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(*listing))
}
