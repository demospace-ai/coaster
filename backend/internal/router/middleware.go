package router

import (
	"fabra/internal/application"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/handlers"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

var ALLOWED_ORIGINS = []string{"https://app.fabra.io"}
var ALLOWED_HEADERS = []string{"Content-Type"}

func WrapWithEnv(db *gorm.DB, handler BaseHandlerFunc) EnvHandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		auth, err := auth.GetAuthentication(db, r)
		if err != nil {
			return err
		}

		env := handlers.Env{
			Db:   db,
			Auth: *auth,
		}
		return handler(env, w, r)
	}
}

func WrapWithErrorHandling(handler EnvHandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := handler(w, r)
		if err == nil {
			return
		}

		switch e := err.(type) {
		case errors.HttpError:
			http.Error(w, e.ClientVisibleData, e.Code)
		default:
			log.Printf("Unexpected error: %+v", err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
	})
}

func isOriginAllowed(origin string) bool {
	if !application.IsProd() {
		return true
	}

	for _, allowedOrigin := range ALLOWED_ORIGINS {
		if origin == allowedOrigin {
			return true
		}
	}

	log.Printf("Origin not allowed: %s", origin)
	return false
}

// CORSMiddleware automatically sets the Access-Control-Allow-* response headers
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if isOriginAllowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", strings.Join(ALLOWED_HEADERS, ","))
		route := mux.CurrentRoute(r)
		methods, err := route.GetMethods()
		if err != nil {
			return
		}

		w.Header().Set("Access-Control-Allow-Methods", strings.Join(methods, ","))

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}
