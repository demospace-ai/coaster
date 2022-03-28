package main

import (
	"fabra/internal/config"
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

    // TODO
	//db, err := database.InitDatabase()
	//if err != nil {
	//	log.Fatal(err)
	//	return
	//}

	rand.Seed(time.Now().UTC().UnixNano())

	router.RunServer()
}
