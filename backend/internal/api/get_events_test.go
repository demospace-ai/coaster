package api_test

import (
	"encoding/json"
	"fabra/internal/api"
	"fabra/internal/auth"
	"fabra/internal/models"
	"fabra/internal/test"
	"fmt"
	"net/http"
	"net/http/httptest"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func createGetEventsRequest(connectionID int64, eventSetID int64) *http.Request {
	req, err := http.NewRequest("GET", "/get_events", nil)
	Expect(err).To(BeNil())
	q := req.URL.Query()
	q.Add("connectionID", fmt.Sprint(connectionID))
	q.Add("eventSetID", fmt.Sprint(eventSetID))
	req.URL.RawQuery = q.Encode()
	return req
}

var _ = Describe("RunQueryHandler", func() {
	var (
		organization *models.Organization
		user         *models.User
		reqAuth      auth.Authentication
	)

	BeforeEach(func() {
		organization = test.CreateOrganization(db)
		user = test.CreateUser(db, organization.ID)
		reqAuth = auth.Authentication{
			User:            user,
			Organization:    organization,
			IsAuthenticated: true,
		}
	})

	It("should not allow access to another organization's data connection", func() {
		otherOrganization := test.CreateOrganization(db)
		otherConnection := test.CreateDataConnection(db, otherOrganization.ID)

		// The event set should use the user's actual organization, that isn't what this
		// test is testing.
		connection := test.CreateDataConnection(db, organization.ID)
		eventSet := test.CreateEventSet(db, organization.ID, connection.ID)

		rr := httptest.NewRecorder()
		req := createGetEventsRequest(otherConnection.ID, eventSet.ID)

		err := service.GetEvents(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should not allow access to another organization's event set", func() {
		connection := test.CreateDataConnection(db, organization.ID)

		// Even if the event set has a valid data connection, it should still block the query
		otherOrganization := test.CreateOrganization(db)
		eventSet := test.CreateEventSet(db, otherOrganization.ID, connection.ID)

		rr := httptest.NewRecorder()
		req := createGetEventsRequest(connection.ID, eventSet.ID)

		err := service.GetEvents(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should succeed with the a data connection in the user's organization", func() {
		connection := test.CreateDataConnection(db, organization.ID)
		eventSet := test.CreateEventSet(db, organization.ID, connection.ID)

		rr := httptest.NewRecorder()
		req := createGetEventsRequest(connection.ID, eventSet.ID)

		err := service.GetEvents(reqAuth, rr, req)
		Expect(err).To(BeNil())

		response := rr.Result()
		Expect(response.StatusCode).To(Equal(http.StatusOK))

		var result api.RunQueryResponse
		err = json.NewDecoder(response.Body).Decode(&result)
		Expect(err).To(BeNil())

		// TODO: test the results
	})
})
