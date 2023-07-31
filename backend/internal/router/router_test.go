package router_test

import (
	"io"
	"net/http"
	"net/http/httptest"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/test"
	"go.fabra.io/server/internal/router"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

type FakeService struct {
}

func (s FakeService) AuthenticatedRoutes() []router.AuthenticatedRoute {
	return []router.AuthenticatedRoute{
		{
			Name:        "Authenticated",
			Method:      router.GET,
			Pattern:     "/authenticated",
			HandlerFunc: s.Authenticated,
		},
	}
}

func (s FakeService) UnauthenticatedRoutes() []router.UnauthenticatedRoute {
	return []router.UnauthenticatedRoute{
		{
			Name:        "Unauthenticated",
			Method:      router.GET,
			Pattern:     "/unauthenticated",
			HandlerFunc: s.Unauthenticated,
		},
		{
			Name:        "Error",
			Method:      router.GET,
			Pattern:     "/error",
			HandlerFunc: s.Error,
		},
		{
			Name:        "Error",
			Method:      router.GET,
			Pattern:     "/httperror",
			HandlerFunc: s.HttpError,
		},
	}
}

func (s FakeService) Authenticated(_ auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (s FakeService) Unauthenticated(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (s FakeService) Error(w http.ResponseWriter, r *http.Request) error {
	return errors.Wrap(errors.WrapCustomerVisibleError(errors.Wrap(errors.New("error"), "should be visible")), "should not be visible")
}

func (s FakeService) HttpError(w http.ResponseWriter, r *http.Request) error {
	return errors.Wrap(errors.NewBadRequest("should be visible"), "should not be visible")
}

var _ = Describe("Router", func() {
	var (
		activeSessionCookie  *http.Cookie
		expiredSessionCookie *http.Cookie
		apiKey               string
	)

	BeforeEach(func() {
		fakeService := FakeService{}
		r.RegisterRoutes(fakeService)

		org := test.CreateOrganization(db)
		user := test.CreateUser(db, org.ID)
		activeSessionToken := test.CreateActiveSession(db, user.ID)
		activeSessionCookie = &http.Cookie{
			Name:  auth.SESSION_COOKIE_NAME,
			Value: activeSessionToken,
		}
		expiredSessionToken := test.CreateExpiredSession(db, user.ID)
		expiredSessionCookie = &http.Cookie{
			Name:  auth.SESSION_COOKIE_NAME,
			Value: expiredSessionToken,
		}
		apiKey = test.CreateApiKey(db, org.ID)
	})

	It("returns 401 when no session token provided for authenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/authenticated", nil)
		Expect(err).To(BeNil())

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusUnauthorized))
	})

	It("returns 401 when expired session cookie provided for authenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/authenticated", nil)
		Expect(err).To(BeNil())
		req.AddCookie(expiredSessionCookie)

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusUnauthorized))
	})

	It("returns 200 when active session cookie provided for authenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/authenticated", nil)
		Expect(err).To(BeNil())
		req.AddCookie(activeSessionCookie)

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusOK))
	})

	It("returns 200 when API key and no session token provided for authenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/authenticated", nil)
		Expect(err).To(BeNil())
		req.Header.Add("X-API-KEY", apiKey)

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusOK))
	})

	It("returns 200 when API key and expired session token provided for authenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/authenticated", nil)
		Expect(err).To(BeNil())
		req.Header.Add("X-API-KEY", apiKey)
		req.AddCookie(expiredSessionCookie)

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusOK))
	})

	It("returns success when no session token provided for unauthenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/unauthenticated", nil)
		Expect(err).To(BeNil())

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusOK))
	})

	It("returns success when expired session token provided for unauthenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/unauthenticated", nil)
		Expect(err).To(BeNil())
		req.AddCookie(expiredSessionCookie)

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusOK))
	})

	It("returns success when active session token provided for unauthenticated route", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/unauthenticated", nil)
		Expect(err).To(BeNil())
		req.AddCookie(activeSessionCookie)

		r.ServeHTTP(rr, req)

		result := rr.Result()
		Expect(result.StatusCode).To(Equal(http.StatusOK))
	})

	It("returns only customer visible portion of error", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/error", nil)
		Expect(err).To(BeNil())

		r.ServeHTTP(rr, req)

		result := rr.Result()
		body, err := io.ReadAll(result.Body)
		Expect(err).To(BeNil())
		Expect(string(body)).To(Equal("should be visible: error\n"))
		Expect(string(body)).ToNot(ContainSubstring("should not be visible"))
		Expect(result.StatusCode).To(Equal(http.StatusBadRequest))
	})

	It("returns customer visible http error", func() {
		rr := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/httperror", nil)
		Expect(err).To(BeNil())

		r.ServeHTTP(rr, req)

		result := rr.Result()
		body, err := io.ReadAll(result.Body)
		Expect(err).To(BeNil())
		Expect(string(body)).To(Equal("should be visible\n"))
		Expect(string(body)).ToNot(ContainSubstring("should not be visible"))
		Expect(result.StatusCode).To(Equal(http.StatusBadRequest))
	})
})
