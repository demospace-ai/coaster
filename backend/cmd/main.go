package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/webp"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	image_lib "go.fabra.io/server/common/images"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/internal/api"
	"go.fabra.io/server/internal/router"
	"gorm.io/gorm"

	"github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
	db, err := database.InitDatabase()
	if err != nil {
		log.Fatal(err)
		return
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		os.Exit(1)
	}()

	if application.IsProd() {
		highlight.SetProjectID("7e3vw5g1")
		highlight.Start()
		defer highlight.Stop()
	}

	cryptoService := crypto.NewCryptoService()
	authService := auth.NewAuthService(db, cryptoService)
	apiService := api.NewApiService(db, authService, cryptoService)

	images, _ := loadAllImages(db)
	for _, image := range images {
		metadata, err := GetGcsMetadata(image.StorageID)
		if err != nil {
			log.Fatal(err)
		}
		if metadata.ContentType == "image/svg+xml" {
			UpdateImageSize(db, &image, 512, 512)
			continue
		}

		imgConfig, err := loadImageFromURL(image_lib.GetGcsImageUrl(image.StorageID))
		if err != nil {
			log.Fatal(err)
		}

		UpdateImageSize(db, &image, imgConfig.Width, imgConfig.Height)
	}

	users, _ := loadAllProfileImages(db)
	for _, user := range users {
		if user.ProfilePictureURL == nil {
			continue
		}

		imgConfig, err := loadImageFromURL(*user.ProfilePictureURL)
		if err != nil {
			fmt.Println("Unexpected profile picture, setting size to 512x512")
			UpdateProfilePictureSize(db, &user, 512, 512)
			continue
		}

		UpdateProfilePictureSize(db, &user, imgConfig.Width, imgConfig.Height)
	}

	router := router.NewRouter(authService)
	router.RunService(apiService)
}

func loadImageFromURL(URL string) (*image.Config, error) {
	response, err := http.Get(URL)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		return nil, errors.New("received non 200 response code")
	}

	img, _, err := image.DecodeConfig(response.Body)
	if err != nil {
		return nil, err
	}

	return &img, nil
}

func loadAllImages(db *gorm.DB) ([]models.ListingImage, error) {
	var listingImages []models.ListingImage
	result := db.Table("listing_images").
		Select("listing_images.*").
		Where("listing_images.deactivated_at IS NULL").
		Find(&listingImages)
	if result.Error != nil {
		return nil, result.Error
	}

	return listingImages, nil
}

func loadAllProfileImages(db *gorm.DB) ([]models.User, error) {
	var users []models.User
	result := db.Table("users").
		Select("users.*").
		Where("users.deactivated_at IS NULL").
		Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}

	return users, nil
}

type GcsMetadata struct {
	ContentType string `json:"contentType"`
}

func GetGcsMetadata(storageID string) (*GcsMetadata, error) {
	var bucketName string
	if application.IsProd() {
		bucketName = "user-images-bucket-us"
	} else {
		bucketName = "dev-user-images-bucket"
	}

	// TODO: put images.trycoaster.com here for Prod to get CDN
	metadataURL := fmt.Sprintf("https://storage.googleapis.com/storage/v1/b/%s/o/%s", bucketName, storageID)
	response, err := http.Get(metadataURL)
	if err != nil {
		return nil, err
	}

	decoder := json.NewDecoder(response.Body)
	var metadata GcsMetadata
	err = decoder.Decode(&metadata)
	if err != nil {
		return nil, err
	}

	return &metadata, nil
}

func UpdateImageSize(db *gorm.DB, image *models.ListingImage, width int, height int) error {
	image.Width = width
	image.Height = height
	result := db.Save(image)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

func UpdateProfilePictureSize(db *gorm.DB, user *models.User, width int, height int) error {
	user.ProfilePictureWidth = &width
	user.ProfilePictureHeight = &height
	result := db.Save(user)
	if result.Error != nil {
		return result.Error
	}

	return nil
}
