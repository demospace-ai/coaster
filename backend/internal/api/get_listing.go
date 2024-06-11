package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/repositories/listings"
	"go.coaster.io/server/common/views"
)

func (s ApiService) GetListing(w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.GetListing) missing listing ID from GetListing request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.GetListing)")
	}

	auth, err := s.authService.GetAuthentication(r)
	if err != nil {
		return errors.Wrap(err, "(api.GetListing) unexpected authentication error")
	}

	listing, err := listings.LoadDetailsByIDAndUser(
		s.db,
		listingID,
		auth.User,
	)
	if err != nil {
		if errors.IsRecordNotFound(err) {
			return errors.NotFound
		} else {
			return errors.Wrap(err, "(api.GetListing) loading listing")
		}
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(*listing))
}
