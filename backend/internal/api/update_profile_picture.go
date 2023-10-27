package api

import (
	"context"
	"encoding/json"
	"fmt"
	"image"
	"io"
	"net/http"

	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/webp"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/repositories/users"
	"go.fabra.io/server/common/views"
)

func (s ApiService) UpdateProfilePicture(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	file, handler, err := r.FormFile("profile_picture")
	if err != nil {
		return errors.Wrap(err, "(api.UpdateProfilePicture) opening file")
	}
	defer file.Close()

	if (handler.Size / 1024) > 1024 {
		return errors.NewBadRequest("Image must be less than 1MB")
	}

	contentType := handler.Header.Get("Content-Type")
	if _, supported := SUPPORTED_IMAGE_TYPES[contentType]; !supported {
		return errors.NewBadRequestf("Unsupported image type: %s", contentType)
	}

	imageCfg, _, err := image.DecodeConfig(file)
	if err != nil {
		return errors.Wrap(err, "(api.AddListingImage) decoding image config")
	}

	client, err := storage.NewClient(context.TODO())
	if err != nil {
		return errors.Wrap(err, "(api.UpdateProfilePicture) opening storage client")
	}
	defer client.Close()

	userImagesBucket := getUserImageBucket()
	storageID := uuid.New().String()

	o := client.Bucket(userImagesBucket).Object(storageID)
	o = o.If(storage.Conditions{DoesNotExist: true}) // TODO: figure out the right conditions here
	wc := o.NewWriter(context.TODO())
	wc.ContentType = contentType
	if _, err = io.Copy(wc, file); err != nil {
		return errors.Wrap(err, "(api.UpdateProfilePicture) copying file to storage")
	}
	if err := wc.Close(); err != nil {
		return errors.Wrap(err, "(api.UpdateProfilePicture) closing file")
	}

	// TODO: do this transactionally or figure out something to handle failures
	user, err := users.UpdateProfilePicture(s.db, auth.User, getProfilePictureURL(storageID), imageCfg.Width, imageCfg.Height)
	if err != nil {
		return errors.Wrap(err, "(api.UpdateProfilePicture) saving listing image details to DB")
	}

	return json.NewEncoder(w).Encode(views.ConvertUser(*user))
}

func getProfilePictureURL(storageID string) string {
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", getUserImageBucket(), storageID)
}
