package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/webp"
	"gorm.io/gorm"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
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

	updateDescriptions(db)

	cryptoService := crypto.NewCryptoService()
	authService := auth.NewAuthService(db, cryptoService)
	apiService := api.NewApiService(db, authService, cryptoService)

	router := router.NewRouter(authService)
	router.RunService(apiService)
}

func updateDescriptions(db *gorm.DB) {
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.deactivated_at IS NULL").
		Find(&listings)

	if result.Error != nil {
		log.Fatal(result.Error)
		return
	}

	for _, listing := range listings {
		if listing.Description != nil && !strings.Contains((*listing.Description), "</p>") {
			newDescription := fmt.Sprintf("<p>%s</p>", strings.ReplaceAll((*listing.Description), "\n", "</p><p>"))
			listing.Description = &newDescription
			result := db.Save(&listing)
			if result.Error != nil {
				log.Fatal(result.Error)
				return
			}
		}
	}
}
