package api

import (
	"encoding/json"
	"net/http"

	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/repositories/listings"
	"go.coaster.io/server/common/repositories/users"
	"go.coaster.io/server/common/views"
)

func (s ApiService) GetDraftListing(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	listing, err := listings.GetDraftListing(
		s.db,
		auth.User.ID,
	)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			return errors.NotFound
		} else {
			return errors.Wrap(err, "(api.GetDraftListing) getting new listing")
		}
	}

	if !auth.User.IsHost {
		err = users.SetIsHost(s.db, auth.User.ID, true)
		if err != nil {
			return errors.Wrap(err, "(api.GetDraftListing) setting user as host")
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(*listing))
}
