package images

import (
	"fmt"

	"go.coaster.io/server/common/application"
)

func GetGcsImageUrl(storageID string) string {
	var bucketName string
	if application.IsProd() {
		bucketName = "user-images-bucket-us"
	} else {
		bucketName = "dev-user-images-bucket"
	}

	// TODO: put images.trycoaster.com here for Prod to get CDN
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, storageID)
}
