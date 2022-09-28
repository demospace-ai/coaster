package main

import (
	"fabra/internal/api"
	"fabra/internal/config"
	"fabra/internal/crypto"
	"fabra/internal/database"
	"fabra/internal/query"
	"fabra/internal/router"
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

	cryptoService := crypto.NewCryptoService()
	queryService := query.NewQueryService(cryptoService)
	apiService := api.NewApiService(db, cryptoService, queryService)

	router := router.NewRouter(db)
	router.RunService(apiService)
}
