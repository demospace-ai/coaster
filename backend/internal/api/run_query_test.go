package api_test

import (
	"encoding/json"
	"fabra/internal/api"
	"fabra/internal/auth"
	"fabra/internal/models"
	"fabra/internal/test"
	"net/http"
	"net/http/httptest"
	"strings"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func createRunQueryRequest(connectionID int64) *http.Request {
	reqBody := api.RunQueryRequest{
		ConnectionID: connectionID,
		QueryString:  "select * from test;",
	}
	b, err := json.Marshal(&reqBody)
	Expect(err).To(BeNil())

	req, err := http.NewRequest("POST", "/run_query", strings.NewReader(string(b)))
	Expect(err).To(BeNil())

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
		connection := test.CreateDataConnection(db, otherOrganization.ID)

		rr := httptest.NewRecorder()
		req := createRunQueryRequest(connection.ID)

		err := service.RunQuery(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should succeed with the a data connection in the user's organization", func() {
		connection := test.CreateDataConnection(db, organization.ID)

		rr := httptest.NewRecorder()
		req := createRunQueryRequest(connection.ID)

		err := service.RunQuery(reqAuth, rr, req)
		Expect(err).To(BeNil())

		response := rr.Result()
		Expect(response.StatusCode).To(Equal(http.StatusOK))

		var result api.RunQueryResponse
		err = json.NewDecoder(response.Body).Decode(&result)
		Expect(err).To(BeNil())

		// TODO: test the results
	})
})
