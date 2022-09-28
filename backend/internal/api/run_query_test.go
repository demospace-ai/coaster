package api_test

import (
	"encoding/json"
	"fabra/internal/api"
	"fabra/internal/auth"
	"fabra/internal/models"
	"fabra/internal/test"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("RunQueryHandler", func() {
	var (
		organization *models.Organization
		user         *models.User
		reqAuth      auth.Authentication
	)

	BeforeEach(func() {
		organization = test.CreateTestOrganization(db)
		user = test.CreateTestUser(db, organization.ID)
		reqAuth = auth.Authentication{
			User:            user,
			Organization:    organization,
			IsAuthenticated: true,
		}
	})

	It("should not allow access to another organization's data connection", func() {
		otherOrganization := test.CreateTestOrganization(db)
		connection := test.CreateTestDataConnection(db, otherOrganization.ID)
		reqBody := createRunQueryRequest(connection.ID)

		rr := httptest.NewRecorder()
		req, err := http.NewRequest("POST", "/run_query", reqBody)
		Expect(err).To(BeNil())

		err = service.RunQuery(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should succeed with the a data connection in the user's organization", func() {
		connection := test.CreateTestDataConnection(db, organization.ID)
		reqBody := createRunQueryRequest(connection.ID)

		rr := httptest.NewRecorder()
		req, err := http.NewRequest("POST", "/run_query", reqBody)
		Expect(err).To(BeNil())

		err = service.RunQuery(reqAuth, rr, req)
		Expect(err).To(BeNil())

		response := rr.Result()
		Expect(response.StatusCode).To(Equal(http.StatusOK))

		var result api.RunQueryResponse
		err = json.NewDecoder(response.Body).Decode(&result)
		Expect(err).To(BeNil())

		// TODO: test the results
	})
})

func createRunQueryRequest(connectionID int64) io.Reader {
	reqBody := api.RunQueryRequest{
		ConnectionID: connectionID,
		QueryString:  "select * from test;",
	}
	b, err := json.Marshal(&reqBody)
	Expect(err).To(BeNil())

	return strings.NewReader(string(b))
}
