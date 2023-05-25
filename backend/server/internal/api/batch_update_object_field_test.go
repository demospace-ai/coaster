package api_test

import (
	"bytes"
	"encoding/json"
	"io"
	"math"
	"net/http/httptest"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/views"

	"github.com/go-playground/validator/v10"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"go.fabra.io/server/common/test"
	"go.fabra.io/server/internal/api"
)

var _ = Describe("Sending an ObjectField batch update request", func() {
	var auth auth.Authentication

	makeRequestBody := func(body interface{}) io.Reader {
		jsonBody, _ := json.Marshal(body)
		return bytes.NewReader(jsonBody)
	}

	BeforeEach(func() {
		auth = getAuth(db)
	})

	Context("with an empty list", func() {
		It("should return a 200 status code", func() {
			response := httptest.NewRecorder()
			request := httptest.NewRequest("PATCH", "/object_field", makeRequestBody([]map[string]interface{}{}))
			err := service.BatchUpdateObjectField(auth, response, request)
			Expect(err).To(BeNil(), "no error should be returned, got %s", err)
			Expect(response.Code).To(Equal(200))
		})
	})

	Context("with an object body that's missing ID", func() {
		It("should fail validation", func() {
			response := httptest.NewRecorder()
			request := httptest.NewRequest("PATCH", "/object_field", makeRequestBody([]map[string]interface{}{
				{},
			}))
			err := service.BatchUpdateObjectField(auth, response, request)
			Expect(err).To(BeAssignableToTypeOf(validator.ValidationErrors{}))
			fieldError := err.(validator.ValidationErrors)[0]
			Expect(fieldError.Field()).To(Equal("ID"))
		})
	})

	Context("with an object id but no change", func() {
		It("should return a 200 status code", func() {
			dest, _ := test.CreateDestination(db, auth.Organization.ID)
			obj := test.CreateObject(db, auth.Organization.ID, dest.ID, models.SyncModeFullOverwrite)
			desc := "test description (shouldn't change)"
			objFields := test.CreateObjectFields(db, obj.ID, []input.ObjectField{
				{
					Name:        "test (shouldn't change)",
					Description: &desc, // Description will not be updated
				},
			})
			response := httptest.NewRecorder()
			request := httptest.NewRequest("PATCH", "/object_field", makeRequestBody([]map[string]interface{}{
				{
					"id": objFields[0].ID,
					// Do not provide Description (This tests partial update)
				},
			}))
			err := service.BatchUpdateObjectField(auth, response, request)
			Expect(err).To(BeNil(), "no error should be returned, got %s", err)
			Expect(response.Code).To(Equal(200))
			var actual api.BatchCreateObjectFieldResponse
			json.Unmarshal(response.Body.Bytes(), &actual)
			Expect(*actual.ObjectFields[0].Description).To(Equal("test description (shouldn't change)"))
			Expect(actual.ObjectFields[0].Name).To(Equal("test (shouldn't change)"))
		})
	})

	Context("to change an object's properties", func() {
		It("should return a 200 status code, and update the anme", func() {
			dest, _ := test.CreateDestination(db, auth.Organization.ID)
			obj := test.CreateObject(db, auth.Organization.ID, dest.ID, models.SyncModeFullOverwrite)
			disname := "old display name"
			objField := test.CreateObjectFields(db, obj.ID, []input.ObjectField{
				{
					Name:        "old name",
					Description: nil,      // description will be updated from null to "new description"
					DisplayName: &disname, // display name will be updated from "old display name" to null
				},
			})[0]
			response := httptest.NewRecorder()
			desc := "new description"
			request := httptest.NewRequest("PATCH", "/object_field", makeRequestBody([]map[string]interface{}{
				{
					"id":           objField.ID,
					"name":         "new name",
					"description":  desc,
					"display_name": nil, // This will set {"display_name": null}
				},
			}))
			err := service.BatchUpdateObjectField(auth, response, request)
			Expect(err).To(BeNil(), "no error should be returned, got %s", err)
			Expect(response.Code).To(Equal(200))
			expect, _ := json.Marshal(api.BatchUpdateObjectFieldResponse{
				ObjectFields: []views.ObjectField{
					{
						ID:          objField.ID,
						Name:        "new name",
						Description: &desc,
						DisplayName: nil, // Expects {"display_name": null} (or no display_name key)
					},
				},
				Failures: []int64{},
			})
			Expect(response.Body).To(MatchJSON(expect))
		})
	})

	Context("with an object id that doesn't exist", func() {
		It("should return a 200 status code, include the id in failures", func() {
			response := httptest.NewRecorder()
			request := httptest.NewRequest("PATCH", "/object_field", makeRequestBody([]map[string]interface{}{
				{
					"id": math.MaxInt64,
				},
			}))
			err := service.BatchUpdateObjectField(auth, response, request)
			Expect(err).To(BeNil(), "no error should be returned, got %s", err)
			Expect(response.Code).To(Equal(200))
			expect, _ := json.Marshal(api.BatchUpdateObjectFieldResponse{
				ObjectFields: []views.ObjectField{},
				Failures: []int64{
					math.MaxInt64,
				},
			})
			Expect(response.Body).To(MatchJSON(expect))
		})
	})
})
