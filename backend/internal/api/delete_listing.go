package api

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
)

func (s ApiService) DeleteListing(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.DeleteListingImage) missing listing ID from DeleteListingImage request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteListingImage) parsing listing ID")
	}

	// Make sure this user has ownership of this listing
	listing, err := listings.LoadDetailsByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) loading listing %d for user %d", listingID, auth.User.ID)
	}

	err = listings.DeleteListing(s.db, &listing.Listing)
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) deleting listing %d", listingID)
	}

	return nil
}
