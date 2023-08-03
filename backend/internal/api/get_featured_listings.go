package api

import (
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
	"go.fabra.io/server/common/views"
)

type GetFeaturedListingsResponse struct {
	Listings []views.Listing `json:"listings"`
}

func (s ApiService) GetFeaturedListings(w http.ResponseWriter, r *http.Request) error {
	listings, err := listings.LoadFeatured(s.db)
	if err != nil {
		return errors.Wrap(err, "(api.GetFeaturedListings) loading listings")
	}

	return json.NewEncoder(w).Encode(views.ConvertListings(listings))
}
