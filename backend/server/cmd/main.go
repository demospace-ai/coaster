package main

import (
	"log"
	"math/rand"
	"time"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/config"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/internal/api"
	"go.fabra.io/server/internal/router"
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
	authService := auth.NewAuthService(db, cryptoService)
	queryService := query.NewQueryService(db, cryptoService)
	apiService := api.NewApiService(db, authService, cryptoService, queryService)

	router := router.NewRouter(authService)
	router.RunService(apiService)
}
