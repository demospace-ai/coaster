package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

func (s ApiService) GetNewListing(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	listing, err := listings.GetDraftListing(
		s.db,
		auth.User.ID,
	)
	if err != nil {
		return errors.Wrap(err, "(api.GetNewListing) getting new listing")
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(*listing))
}
