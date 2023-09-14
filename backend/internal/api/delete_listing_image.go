package api

import (
	"context"
	"net/http"
	"strconv"

	"cloud.google.com/go/storage"
	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
)

func (s ApiService) DeleteListingImage(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.DeleteListingImage) missing listing ID from DeleteListingImage request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteListingImage) parsing listing ID")
	}

	strImageId, ok := vars["imageID"]
	if !ok {
		return errors.Newf("(api.DeleteListingImage) missing listing ID from DeleteListingImage request URL: %s", r.URL.RequestURI())
	}

	imageID, err := strconv.ParseInt(strImageId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.DeleteListingImage) parsing listing ID")
	}

	// Make sure this user has ownership of this listing
	if !auth.User.IsAdmin {
		_, err = listings.LoadByUserAndID(s.db, auth.User.ID, listingID)
		if err != nil {
			return errors.Wrapf(err, "(api.DeleteListingImage) loading listing %d for user %d", listingID, auth.User.ID)
		}
	}

	// No need to update rank of other listings since the order stays the same
	listingImage, err := listings.LoadListingImage(s.db, listingID, imageID)
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) loading image for listing %d", listingID)
	}

	// TODO: do this transactionally or figure out something to handle failures
	err = listings.DeleteListingImage(s.db, listingImage)
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) deleting image %d for listing %d", imageID, listingID)
	}

	client, err := storage.NewClient(context.TODO())
	if err != nil {
		return errors.Wrap(err, "(api.DeleteListingImage) opening storage client")
	}
	defer client.Close()

	userImagesBucket := getUserImageBucket()

	err = client.Bucket(userImagesBucket).Object(listingImage.StorageID).Delete(context.TODO())
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) deleting image %s", listingImage.StorageID)
	}

	return nil
}
