package router

import (
	"log"
	"net/http"
	"strings"

	"go.fabra.io/server/common/application"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"

	"github.com/gorilla/mux"
	highlightGorillaMux "github.com/highlight/highlight/sdk/highlight-go/middleware/gorillamux"
)

var ALLOWED_ORIGINS = []string{"https://www.trycoaster.com", "https://supplier.trycoaster.com", "https://coaster-frontend.onrender.com"}
var ALLOWED_HEADERS = []string{"Content-Type", "X-LINK-TOKEN", "X-API-KEY", "X-TIME-ZONE", "X-HIGHLIGHT-REQUEST"}

type ApiService interface {
	AuthenticatedRoutes() []AuthenticatedRoute
	UnauthenticatedRoutes() []UnauthenticatedRoute
}

type Router struct {
	router      *mux.Router
	authService auth.AuthService
}

func NewRouter(authService auth.AuthService) Router {
	// No HTTPS needed since TLS is terminated by Google Cloud Run
	router := mux.NewRouter()

	return Router{
		router:      router,
		authService: authService,
	}
}

func (r Router) RunService(service ApiService) {
	// We factor out registering the routes so we can use that for testing without
	// actually running the server on a live port
	r.RegisterRoutes(service)
	err := http.ListenAndServe(":8080", r.router)
	if err != nil {
		log.Fatal(err)
	}
}

// Exported for testing
func (r Router) RegisterRoutes(service ApiService) {

	methodMap := map[string][]Method{}
	for _, route := range service.AuthenticatedRoutes() {
		methodMap[route.Pattern] = append(methodMap[route.Pattern], route.Method)
	}
	for _, route := range service.UnauthenticatedRoutes() {
		methodMap[route.Pattern] = append(methodMap[route.Pattern], route.Method)
	}

	for pattern, methods := range methodMap {
		r.router.Handle(pattern, wrapCORSHandler(methods)).Methods("OPTIONS")
	}

	for _, route := range service.AuthenticatedRoutes() {
		wrapped := r.wrapAuthenticatedRoute(route.HandlerFunc)
		r.router.Handle(route.Pattern, wrapped).Methods(route.Method.String())
	}

	for _, route := range service.UnauthenticatedRoutes() {
		wrapped := r.wrapUnauthenticatedRoute(route.HandlerFunc)
		r.router.Handle(route.Pattern, wrapped).Methods(route.Method.String())
	}

	r.router.Use(CORSMiddleware)

	if application.IsProd() {
		r.router.Use(highlightGorillaMux.Middleware)
	}
}

func (r Router) wrapAuthenticatedRoute(handler AuthenticatedHandlerFunc) http.Handler {
	withAuth := r.wrapWithAuth(handler)
	withError := r.wrapWithErrorHandling(withAuth)
	return withError
}

func (r Router) wrapUnauthenticatedRoute(handler ErrorHandlerFunc) http.Handler {
	withError := r.wrapWithErrorHandling(handler)
	return withError
}

func (r Router) wrapWithAuth(handler AuthenticatedHandlerFunc) ErrorHandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) error {
		auth, err := r.authService.GetAuthentication(req)
		if err != nil {
			return err
		}

		if !auth.IsAuthenticated {
			http.Error(w, errors.Unauthorized.Error(), errors.Unauthorized.Code())
			return nil
		}

		return handler(*auth, w, req)
	}
}

func (r Router) wrapWithErrorHandling(handler ErrorHandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		err := handler(w, req)
		if err == nil {
			return
		}

		var httpError *errors.HttpError
		var customerVisisbleError *errors.CustomerVisibleError
		switch {
		case errors.As(err, &httpError):
			log.Printf("HTTP error: %+v", err)
			http.Error(w, httpError.Error(), httpError.Code())
		case errors.As(err, &customerVisisbleError):
			log.Printf("Customer visible error: %+v", err)
			http.Error(w, customerVisisbleError.Error(), http.StatusBadRequest)
		default:
			log.Printf("Unexpected error: %+v", err)
			http.Error(w, "Unexpected error", http.StatusInternalServerError)
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
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		origin := req.Header.Get("Origin")
		if isOriginAllowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", strings.Join(ALLOWED_HEADERS, ","))
		route := mux.CurrentRoute(req)
		methods, err := route.GetMethods()
		if err != nil {
			return
		}

		w.Header().Set("Access-Control-Allow-Methods", strings.Join(methods, ","))

		next.ServeHTTP(w, req)
	})
}

func wrapCORSHandler(methods []Method) http.Handler {
	methodStrings := []string{}
	for _, method := range methods {
		methodStrings = append(methodStrings, method.String())
	}
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Access-Control-Allow-Methods", strings.Join(methodStrings, ","))
		w.WriteHeader(http.StatusOK)
	})
}

// Exported for testing
func (r Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	r.router.ServeHTTP(w, req)
}
