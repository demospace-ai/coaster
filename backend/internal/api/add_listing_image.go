package api

import (
	"context"
	"encoding/json"
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
	"go.fabra.io/server/common/views"
)

var SUPPORTED_IMAGE_TYPES = map[string]bool{"image/jpeg": true, "image/png": true, "image/gif": true, "image/svg+xml": true, "image/webp": true}

func (s ApiService) AddListingImage(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	vars := mux.Vars(r)
	strListingId, ok := vars["listingID"]
	if !ok {
		return errors.Newf("(api.AddListingImage) missing listing ID from AddListingImage request URL: %s", r.URL.RequestURI())
	}

	listingID, err := strconv.ParseInt(strListingId, 10, 64)
	if err != nil {
		return errors.Wrap(err, "(api.AddListingImage) parsing listing ID")
	}

	// Make sure this user has ownership of this listing
	if !auth.User.IsAdmin {
		_, err = listings.LoadByIDAndUserID(s.db, auth.User.ID, listingID)
		if err != nil {
			return errors.Wrapf(err, "(api.AddListingImage) loading listing %d for user %d", listingID, auth.User.ID)
		}
	}

	existingImages, err := listings.LoadImagesForListing(s.db, listingID)
	if err != nil {
		return errors.Wrapf(err, "(api.AddListingImage) loading images for listing %d", listingID)
	}
	maxRank := 0
	for _, image := range existingImages {
		if image.Rank > maxRank {
			maxRank = image.Rank
		}
	}

	file, handler, err := r.FormFile("listing_image")
	if err != nil {
		return errors.Wrap(err, "(api.AddListingImage) opening file")
	}
	defer file.Close()

	if (handler.Size / 1024) > (1024 * 5) {
		return errors.NewBadRequest("Image must be less than 5MB")
	}

	contentType := handler.Header.Get("Content-Type")
	if _, supported := SUPPORTED_IMAGE_TYPES[contentType]; !supported {
		return errors.NewBadRequestf("Unsupported image type: %s", contentType)
	}

	client, err := storage.NewClient(context.TODO())
	if err != nil {
		return errors.Wrap(err, "(api.AddListingImage) opening storage client")
	}
	defer client.Close()

	userImagesBucket := getUserImageBucket()
	storageID := uuid.New().String()

	o := client.Bucket(userImagesBucket).Object(storageID)
	o = o.If(storage.Conditions{DoesNotExist: true}) // TODO: figure out the right conditions here
	wc := o.NewWriter(context.TODO())
	wc.ContentType = contentType
	if _, err = io.Copy(wc, file); err != nil {
		return errors.Wrap(err, "(api.AddListingImage) copying file to storage")
	}
	if err := wc.Close(); err != nil {
		return errors.Wrap(err, "(api.AddListingImage) closing file")
	}

	// TODO: do this transactionally or figure out something to handle failures
	listingImage, err := listings.CreateListingImage(
		s.db,
		listingID,
		storageID,
		maxRank+1,
	)
	if err != nil {
		return errors.Wrap(err, "(api.AddListingImage) saving listing image details to DB")
	}

	return json.NewEncoder(w).Encode(views.Image{
		ID:        listingImage.ID,
		StorageID: listingImage.StorageID,
	})
}

func getUserImageBucket() string {
	if application.IsProd() {
		return "user-images-bucket-us"
	} else {
		return "dev-user-images-bucket"
	}
}
