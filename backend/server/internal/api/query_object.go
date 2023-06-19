package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/repositories/syncs"
)

type QueryFilter struct {
	FieldName  string `json:"field_name" validate:"required"`
	FieldValue string `json:"field_value" validate:"required"`
}

type QueryObjectRequest struct {
	EndCustomerID string        `json:"end_customer_id" validate:"required"`
	ObjectID      int64         `json:"object_id" validate:"required"`
	Filters       []QueryFilter `json:"filters,omitempty"`
}

func (s ApiService) QueryObject(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "(api.QueryObject)")
	}

	decoder := json.NewDecoder(r.Body)
	var queryObjectRequest QueryObjectRequest
	err := decoder.Decode(&queryObjectRequest)
	if err != nil {
		return errors.Wrap(err, "(api.QueryObject) invalid request")
	}

	// TODO: validate connection parameters
	validate := validator.New()
	err = validate.Struct(queryObjectRequest)
	if err != nil {
		return errors.Wrap(errors.WrapCustomerVisibleError(err), "(api.QueryObject)")
	}

	payload, err := s.queryObject(auth.Organization, queryObjectRequest.EndCustomerID, queryObjectRequest.ObjectID, queryObjectRequest.Filters)
	if err != nil {
		return errors.Wrap(err, "(api.QueryObject) running query")
	}

	// TODO: should we include any additional information here?
	return json.NewEncoder(w).Encode(payload)
}

func (s ApiService) queryObject(organization *models.Organization, endCustomerID string, objectID int64, filters []QueryFilter) (map[string]any, error) {
	syncList, err := syncs.LoadSyncsForCustomerAndObject(s.db, organization.ID, endCustomerID, objectID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to load syncs")
	}

	if len(syncList) > 1 || len(syncList) == 0 {
		return nil, errors.Wrap(errors.NewBadRequest("must have exactly one sync per object"), "(api.queryObject)")
	}

	sync := syncList[0]

	source, err := sources.LoadSourceByID(s.db, organization.ID, endCustomerID, sync.SourceID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to load source")
	}

	connection, err := connections.LoadConnectionByID(s.db, organization.ID, source.ConnectionID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to load connection")
	}

	// Validate the organization owns the object
	object, err := objects.LoadObjectByID(s.db, organization.ID, objectID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to load object")
	}

	fieldMappings, err := syncs.LoadFieldMappingsForSync(s.db, sync.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to load field mappings")
	}

	objectFields, err := objects.LoadObjectFieldsByID(s.db, object.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to load object fields")
	}

	orderedObjectFields := createOrderedObjectFields(objectFields, fieldMappings)

	client, err := s.queryService.GetClient(context.TODO(), connection)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to get client")
	}

	// TODO: apply filters
	readQuery := getReadQuery(connection, sync, fieldMappings)

	data, err := client.RunQuery(context.TODO(), readQuery)
	if err != nil {
		return nil, errors.Wrap(err, "(api.queryObject) failed to run query")
	}

	if len(data.Data) > 1 || len(data.Data) == 0 {
		return nil, errors.Wrap(errors.NewBadRequest("must have exactly one record"), "(api.queryObject)")
	}

	row := data.Data[0]
	outputData := map[string]any{}
	for i, value := range row {
		fieldMapping := fieldMappings[i]
		destFieldName := orderedObjectFields[i].Name
		// add raw values to the json object even if they're nil
		if fieldMapping.IsJsonField {
			existing, ok := outputData[destFieldName]
			if !ok {
				existing = make(map[string]any)
				outputData[destFieldName] = existing
			}

			existing.(map[string]any)[fieldMapping.SourceFieldName] = value
		} else {
			if value != nil {
				outputData[destFieldName] = value
			}
		}
	}

	return outputData, nil
}

func getReadQuery(sourceConnection *models.Connection, sync models.Sync, fieldMappings []models.FieldMapping) string {
	var queryString string
	if sync.CustomJoin.Valid {
		queryString = sync.CustomJoin.String
	} else {
		fields := []string{}
		for _, fieldMapping := range fieldMappings {
			fields = append(fields, fieldMapping.SourceFieldName)
		}
		selectString := strings.Join(fields, ",")
		queryString = fmt.Sprintf("SELECT %s FROM %s.%s", selectString, sync.Namespace.String, sync.TableName.String)
	}

	return fmt.Sprintf("%s;", queryString)
}

func createOrderedObjectFields(objectFields []models.ObjectField, fieldMappings []models.FieldMapping) []models.ObjectField {
	objectFieldIdToObjectField := make(map[int64]models.ObjectField)
	for _, objectField := range objectFields {
		objectFieldIdToObjectField[objectField.ID] = objectField
	}

	var orderedObjectFields []models.ObjectField
	for _, fieldMapping := range fieldMappings {
		orderedObjectFields = append(orderedObjectFields, objectFieldIdToObjectField[fieldMapping.DestinationFieldId])
	}

	return orderedObjectFields
}
