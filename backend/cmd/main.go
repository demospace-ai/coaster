package main

import (
	"fabra/internal/api"
	"fabra/internal/config"
	"fabra/internal/database"
	"fabra/internal/server"
	"log"
	"math/rand"
	"time"
)

func main() {
	err := config.InitConfig()
	if err != nil {
		log.Fatal(err)
		return
	}

	db, err := database.InitDatabase()
	if err != nil {
		log.Fatal(err)
		return
	}

	rand.Seed(time.Now().UTC().UnixNano())

	apiService := api.NewService(db)
	server.RunService(db, apiService)
}
