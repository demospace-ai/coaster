package server

import (
	"fabra/internal/api"
	"fabra/internal/application"
	"fabra/internal/auth"
	"fabra/internal/errors"
	"fabra/internal/route"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

var ALLOWED_ORIGINS = []string{"https://app.fabra.io"}
var ALLOWED_HEADERS = []string{"Content-Type"}

type Server struct {
	db *gorm.DB
}

func NewServer(db *gorm.DB) Server {
	return Server{
		db: db,
	}
}

func (server Server) RunService(service api.Service) {
	// No HTTPS needed since TLS is terminated by Google Cloud Run
	router := mux.NewRouter()

	for _, route := range service.AuthenticatedRoutes() {
		wrapped := server.wrapAuthenticatedRoute(route.HandlerFunc)
		router.Handle(route.Pattern, wrapped).Methods(route.Method.String(), "OPTIONS")
	}

	for _, route := range service.UnauthenticatedRoutes() {
		wrapped := server.wrapUnauthenticatedRoute(route.HandlerFunc)
		router.Handle(route.Pattern, wrapped).Methods(route.Method.String(), "OPTIONS")
	}

	router.Use(CORSMiddleware)

	log.Fatal(http.ListenAndServe(":8080", router))
}

func (s Server) wrapAuthenticatedRoute(handler route.AuthenticatedHandlerFunc) http.Handler {
	withAuth := s.wrapWithAuth(handler)
	withError := s.wrapWithErrorHandling(withAuth)
	return withError
}

func (s Server) wrapUnauthenticatedRoute(handler route.ErrorHandlerFunc) http.Handler {
	withError := s.wrapWithErrorHandling(handler)
	return withError
}

func (s Server) wrapWithAuth(handler route.AuthenticatedHandlerFunc) route.ErrorHandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		auth, err := auth.GetAuthentication(s.db, r)
		if err != nil {
			return err
		}

		if !auth.IsAuthenticated {
			w.WriteHeader(http.StatusUnauthorized)
			return nil
		}

		return handler(*auth, w, r)
	}
}

func (s Server) wrapWithErrorHandling(handler route.ErrorHandlerFunc) http.Handler {
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
