package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

type GetHostedListingsResponse struct {
	Listings []views.Listing `json:"listings"`
}

func (s ApiService) GetHostedListings(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	listings, err := listings.LoadAllByUserID(s.db, auth.User.ID)
	if err != nil {
		return errors.Wrap(err, "(api.GetHostedListings) loading listings")
	}

	return json.NewEncoder(w).Encode(views.ConvertListings(listings))
}
