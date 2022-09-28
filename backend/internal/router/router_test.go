package router_test

import (
	"fabra/internal/auth"
	"fabra/internal/router"
	"fabra/internal/test"
	"net/http"
	"net/http/httptest"

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
	}
}

func (s FakeService) Authenticated(_ auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (s FakeService) Unauthenticated(w http.ResponseWriter, r *http.Request) error {
	return nil
}

var _ = Describe("Router", func() {
	var (
		activeSessionCookie  *http.Cookie
		expiredSessionCookie *http.Cookie
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
})
