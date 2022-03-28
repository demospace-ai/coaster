package router

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func RunServer() {
	// No HTTPS needed since TLS is terminated by Google Cloud Run
	router := mux.NewRouter()

	generateRoutes(router)

	log.Fatal(http.ListenAndServe(":8080", router))
}

func generateRoutes(r *mux.Router) {
	for _, route := range Routes {
		r.Handle(route.Pattern, route.HandlerFunc).Methods(route.Method, "OPTIONS")
	}
}
