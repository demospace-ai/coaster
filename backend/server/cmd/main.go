package main

import (
	"log"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/query"
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

	highlight.SetProjectID("7e3vw5g1")
	highlight.Start()
	defer highlight.Stop()

	cryptoService := crypto.NewCryptoService()
	authService := auth.NewAuthService(db, cryptoService)
	queryService := query.NewQueryService(cryptoService)
	apiService := api.NewApiService(db, authService, cryptoService, queryService)

	router := router.NewRouter(authService)
	router.RunService(apiService)
}
