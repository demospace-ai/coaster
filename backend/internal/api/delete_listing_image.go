package api

import (
	"context"
	"net/http"
	"strconv"

	"cloud.google.com/go/storage"
	"github.com/gorilla/mux"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
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
	listing, err := listings.LoadByIDAndUser(s.db, listingID, auth.User)
	if err != nil {
		return errors.Wrapf(err, "(api.DeleteListingImage) loading listing %d for user %d", listingID, auth.User.ID)
	}

	// No need to update rank of other listings since the order stays the same
	if len(listing.Images) <= 3 && listing.Status != models.ListingStatusDraft {
		return errors.NewCustomerVisibleError("You must have at least 3 images for your listing.")
	}

	var listingImage *models.ListingImage
	for _, image := range listing.Images {
		if image.ID == imageID {
			listingImage = &image
			break
		}
	}

	if listingImage == nil {
		return errors.NewCustomerVisibleError("Image not found.")
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
