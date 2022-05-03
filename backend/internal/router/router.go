package router

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RunServer(db *gorm.DB) {
	// No HTTPS needed since TLS is terminated by Google Cloud Run
	router := mux.NewRouter()

	generateRoutes(db, router)

	router.Use(CORSMiddleware)

	log.Fatal(http.ListenAndServe(":8080", router))
}

func generateRoutes(db *gorm.DB, r *mux.Router) {
	for _, route := range Routes {
		withEnv := WrapWithEnv(db, route.HandlerFunc)
		withErrorHandling := WrapWithErrorHandling(withEnv)
		r.Handle(route.Pattern, withErrorHandling).Methods(route.Method, "OPTIONS")
	}
}
