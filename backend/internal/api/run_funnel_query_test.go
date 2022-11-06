package api_test

import (
	"encoding/json"
	"fabra/internal/api"
	"fabra/internal/auth"
	"fabra/internal/models"
	"fabra/internal/test"
	"fabra/internal/views"
	"net/http"
	"net/http/httptest"
	"strings"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func createRunFunnelQueryRequest(connectionID int64, analysisID int64) *http.Request {
	reqBody := api.RunFunnelQueryRequest{
		AnalysisID: analysisID,
	}
	b, err := json.Marshal(&reqBody)
	Expect(err).To(BeNil())

	req, err := http.NewRequest("POST", "/run_funnel_query", strings.NewReader(string(b)))
	Expect(err).To(BeNil())

	return req
}

var _ = Describe("RunFunnelQueryHandler", func() {
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
		eventSet := test.CreateEventSet(db, organization.ID, connection.ID)
		analysis := test.CreateFunnelAnalysis(db, user.ID, organization.ID, connection.ID, eventSet.ID)

		rr := httptest.NewRecorder()
		req := createRunFunnelQueryRequest(connection.ID, analysis.ID)

		err := service.RunFunnelQuery(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should not allow access to another organization's event set", func() {
		otherOrganization := test.CreateOrganization(db)
		connection := test.CreateDataConnection(db, organization.ID)
		eventSet := test.CreateEventSet(db, otherOrganization.ID, connection.ID)
		analysis := test.CreateFunnelAnalysis(db, user.ID, organization.ID, connection.ID, eventSet.ID)

		rr := httptest.NewRecorder()
		req := createRunFunnelQueryRequest(connection.ID, analysis.ID)

		err := service.RunFunnelQuery(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should not allow access to another organization's analysis", func() {
		otherOrganization := test.CreateOrganization(db)
		connection := test.CreateDataConnection(db, organization.ID)
		eventSet := test.CreateEventSet(db, organization.ID, connection.ID)
		analysis := test.CreateFunnelAnalysis(db, user.ID, otherOrganization.ID, connection.ID, eventSet.ID)

		rr := httptest.NewRecorder()
		req := createRunFunnelQueryRequest(connection.ID, analysis.ID)

		err := service.RunFunnelQuery(reqAuth, rr, req)
		Expect(err).ToNot(BeNil())
		Expect(err.Error()).To(Equal("record not found"))
	})

	It("should succeed with the a data connection in the user's organization", func() {
		connection := test.CreateDataConnection(db, organization.ID)
		eventSet := test.CreateEventSet(db, organization.ID, connection.ID)
		analysis := test.CreateFunnelAnalysis(db, user.ID, organization.ID, connection.ID, eventSet.ID)

		rr := httptest.NewRecorder()
		req := createRunFunnelQueryRequest(connection.ID, analysis.ID)

		err := service.RunCustomQuery(reqAuth, rr, req)
		Expect(err).To(BeNil())

		response := rr.Result()
		Expect(response.StatusCode).To(Equal(http.StatusOK))

		var result views.QueryResult
		err = json.NewDecoder(response.Body).Decode(&result)
		Expect(err).To(BeNil())

		// TODO: test the results
	})
})
