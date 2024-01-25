package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/webp"
	"gorm.io/gorm"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/maps"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/internal/api"
	"go.fabra.io/server/internal/router"

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

	updateListings(db)

	authService := auth.NewAuthService(db)
	apiService := api.NewApiService(db, authService)

	router := router.NewRouter(authService)
	router.RunService(apiService)
}

func updateListings(db *gorm.DB) {
	var listings []models.Listing
	result := db.Table("listings").Select("*").Find(&listings)
	if result.Error != nil {
		log.Fatal(result.Error)
		return
	}

	for _, listing := range listings {
		if listing.Location != nil {
			placeDetails, err := maps.GetPlaceDetails(*listing.PlaceID, *listing.Coordinates)
			if err != nil {
				fmt.Println(err)
				continue
			}

			result := db.Table("listings").Where("id = ?", listing.ID).Updates(map[string]interface{}{
				"city":        placeDetails.City,
				"region":      placeDetails.Region,
				"country":     placeDetails.Country,
				"postal_code": placeDetails.PostalCode,
			})

			if result.Error != nil {
				log.Fatal(result.Error)
				return
			}
		}

	}

}
