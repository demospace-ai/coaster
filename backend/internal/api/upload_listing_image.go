package api

import (
	"context"
	"io"
	"net/http"
	"strconv"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/listings"
)

var SUPPORTED_IMAGE_TYPES = map[string]bool{"image/jpeg": true, "image/png": true, "image/gif": true, "image/svg+xml": true}

func (s ApiService) UploadListingImage(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.UploadListingImage) missing listing ID from UploadListingImage request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.UploadListingImage) parsing listing ID")
	}

	// Make sure this user has ownership of this listing
	_, err = listings.LoadByUserAndID(s.db, auth.User.ID, listingID)
	if err != nil {
		return errors.Wrapf(err, "(api.UploadListingImage) loading listing %d for user %d", listingID, auth.User.ID)
	}

	existingImages, err := listings.LoadImagesForListing(s.db, listingID)
	if err != nil {
		return errors.Wrapf(err, "(api.UploadListingImage) loading images for listing %d", listingID)
	}

	file, handler, err := r.FormFile("listing_image")
	if err != nil {
		return errors.Wrap(err, "(api.UploadListingImage) opening file")
	}
	defer file.Close()

	contentType := handler.Header.Get("Content-Type")
	if _, supported := SUPPORTED_IMAGE_TYPES[contentType]; !supported {
		return errors.NewBadRequestf("Unsupported image type: %s", contentType)
	}

	client, err := storage.NewClient(context.TODO())
	if err != nil {
		return errors.Wrap(err, "(api.UploadListingImage) opening storage client")
	}
	defer client.Close()

	userImagesBucket := getUserImageBucket()
	storageID := uuid.New().String()

	o := client.Bucket(userImagesBucket).Object(storageID)
	o = o.If(storage.Conditions{DoesNotExist: true}) // TODO: figure out the right conditions here
	wc := o.NewWriter(context.TODO())
	wc.ContentType = contentType
	if _, err = io.Copy(wc, file); err != nil {
		return errors.Wrap(err, "(api.UploadListingImage) copying file to storage")
	}
	if err := wc.Close(); err != nil {
		return errors.Wrap(err, "(api.UploadListingImage) closing file")
	}

	// TODO: do this transactionally or figure out something to handle failures
	_, err = listings.CreateListingImage(
		s.db,
		listingID,
		storageID,
		len(existingImages),
	)
	if err != nil {
		return errors.Wrap(err, "(api.UploadListingImage) saving listing image details to DB")
	}

	return nil
}

func getUserImageBucket() string {
	if application.IsProd() {
		return "user-images-bucket-us"
	} else {
		return "dev-user-images-bucket"
	}
}
