package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/webp"

	"go.coaster.io/server/common/application"
	"go.coaster.io/server/common/auth"
	"go.coaster.io/server/common/database"
	"go.coaster.io/server/internal/api"
	"go.coaster.io/server/internal/router"

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

	authService := auth.NewAuthService(db)
	apiService := api.NewApiService(db, authService)

	router := router.NewRouter(authService)
	router.RunService(apiService)
}
