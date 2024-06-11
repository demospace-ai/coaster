package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/repositories/listings"
	"go.coaster.io/server/common/views"
)

type UpdateListingImagesRequest struct {
	Images []input.ListingImage `json:"images"`
}

func (s ApiService) UpdateListingImages(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.UpdateListingImages) missing listing ID from DeleteListingImage request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteListingImage) parsing listing ID")
	}

	decoder := json.NewDecoder(r.Body)
	var updateListingImagesRequest UpdateListingImagesRequest
	err = decoder.Decode(&updateListingImagesRequest)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateListingImages) decoding request")
	}

	// Make sure this user has ownership of this listing or is an admin
	_, err = listings.LoadByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) loading listing %d for user %d", listingID, auth.User.ID)
	}

	// TODO: do this transactionally or figure out something to handle failures
	for idx, image := range updateListingImagesRequest.Images {
		err = listings.UpdateImageRank(s.db, listingID, image.ID, idx)
		if err != nil {
			return errors.Wrapf(err, "(api.DeleteListingImage) updating image %d for listing %d", image.ID, listingID)
		}
	}

	listingDetails, err := listings.LoadDetailsByIDAndUser(
		s.db,
		listingID,
		auth.User,
	)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteListingImage) loading listing details")
	}

	return json.NewEncoder(w).Encode(views.ConvertListing(*listingDetails))
}
