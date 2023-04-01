package api

import (
	"context"
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/views"
	"go.fabra.io/sync/temporal"
	"go.temporal.io/sdk/client"

	"github.com/go-playground/validator/v10"
)

const CLIENT_PEM_KEY = "projects/932264813910/secrets/temporal-client-pem/versions/latest"
const CLIENT_KEY_KEY = "projects/932264813910/secrets/temporal-client-key/versions/latest"

type CreateSyncRequest struct {
	DisplayName       string                 `json:"display_name"`
	EndCustomerId     int64                  `json:"end_customer_id"`
	SourceID          int64                  `json:"source_id"`
	ObjectID          int64                  `json:"object_id"`
	Namespace         *string                `json:"namespace,omitempty"`
	TableName         *string                `json:"table_name,omitempty"`
	CustomJoin        *string                `json:"custom_join,omitempty"`
	SourceCursorField *string                `json:"source_cursor_field,omitempty"`
	SourcePrimaryKey  *string                `json:"source_primary_key,omitempty"`
	SyncMode          *models.SyncMode       `json:"sync_mode,omitempty"`
	Frequency         *int64                 `json:"frequency,omitempty"`
	FrequencyUnits    *models.FrequencyUnits `json:"frequency_units,omitempty"`
	FieldMappings     []input.FieldMapping   `json:"field_mappings"`
}

type CreateSyncResponse struct {
	Sync          views.Sync           `json:"sync"`
	FieldMappings []views.FieldMapping `json:"field_mappings"`
}

func (s ApiService) CreateSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var createSyncRequest CreateSyncRequest
	err := decoder.Decode(&createSyncRequest)
	if err != nil {
		return err
	}

	// TODO: validate connection parameters
	validate := validator.New()
	err = validate.Struct(createSyncRequest)
	if err != nil {
		return err
	}

	if (createSyncRequest.TableName == nil || createSyncRequest.Namespace == nil) && createSyncRequest.CustomJoin == nil {
		return errors.NewBadRequest("must have table_name and namespace or custom_join")
	}

	// this also serves to check that this organization owns the object
	object, err := objects.LoadObjectByID(s.db, auth.Organization.ID, createSyncRequest.ObjectID)
	if err != nil {
		return err
	}

	objectFields, err := objects.LoadObjectFieldsByID(s.db, createSyncRequest.ObjectID)
	if err != nil {
		return err
	}

	// default values for the sync come from the object
	sourceCursorField := getSourceCursorField(object, objectFields, createSyncRequest.FieldMappings)
	sourcePrimaryKey := getSourcePrimaryKey(object, objectFields, createSyncRequest.FieldMappings)
	syncMode := object.SyncMode
	frequency := object.Frequency
	frequencyUnits := object.FrequencyUnits

	// TODO: validate that the organization allows customizing sync settings
	if true {
		if createSyncRequest.SourceCursorField != nil {
			sourceCursorField = createSyncRequest.SourceCursorField
		}
		if createSyncRequest.SourcePrimaryKey != nil {
			sourcePrimaryKey = createSyncRequest.SourcePrimaryKey
		}
		if createSyncRequest.SyncMode != nil {
			syncMode = *createSyncRequest.SyncMode
		}
		if createSyncRequest.Frequency != nil {
			frequency = *createSyncRequest.Frequency
		}
		if createSyncRequest.FrequencyUnits != nil {
			frequencyUnits = *createSyncRequest.FrequencyUnits
		}
	}

	// TODO: create via schedule in Temporal once GA
	// TODO: create field mappings in DB using transaction
	sync, err := syncs.CreateSync(
		s.db,
		auth.Organization.ID,
		createSyncRequest.DisplayName,
		createSyncRequest.EndCustomerId,
		createSyncRequest.SourceID,
		createSyncRequest.ObjectID,
		createSyncRequest.Namespace,
		createSyncRequest.TableName,
		createSyncRequest.CustomJoin,
		sourceCursorField,
		sourcePrimaryKey,
		syncMode,
		frequency,
		frequencyUnits,
	)
	if err != nil {
		return err
	}

	fieldMappings, err := syncs.CreateFieldMappings(
		s.db, auth.Organization.ID, sync.ID, createSyncRequest.FieldMappings,
	)
	if err != nil {
		return err
	}

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		return err
	}
	defer c.Close()
	ctx := context.TODO()
	scheduleClient := c.ScheduleClient()
	schedule, err := createSchedule(frequency, frequencyUnits)
	if err != nil {
		return err
	}

	_, err = scheduleClient.Create(ctx, client.ScheduleOptions{
		ID:                 sync.WorkflowID,
		TriggerImmediately: true,
		Action: &client.ScheduleWorkflowAction{
			TaskQueue: temporal.SyncTaskQueue,
			Workflow:  temporal.SyncWorkflow,
			Args: []interface{}{temporal.SyncInput{
				SyncID: sync.ID, OrganizationID: auth.Organization.ID,
			}},
		},
		Spec: client.ScheduleSpec{
			Intervals: []client.ScheduleIntervalSpec{
				{
					Every: schedule,
				},
			},
		},
	})
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateSyncResponse{
		Sync:          views.ConvertSync(sync),
		FieldMappings: views.ConvertFieldMappings(fieldMappings),
	})
}

func getSourcePrimaryKey(object *models.Object, objectFields []models.ObjectField, fieldMappings []input.FieldMapping) *string {
	if object.PrimaryKey.Valid {
		var destinationPrimaryKey models.ObjectField
		for _, field := range objectFields {
			if field.Name == object.PrimaryKey.String {
				destinationPrimaryKey = field
			}
		}

		for _, fieldMapping := range fieldMappings {
			if fieldMapping.DestinationFieldId == destinationPrimaryKey.ID {
				return &fieldMapping.SourceFieldName
			}
		}
	}

	return nil
}

func getSourceCursorField(object *models.Object, objectFields []models.ObjectField, fieldMappings []input.FieldMapping) *string {
	if object.CursorField.Valid {
		var destinationCursorField models.ObjectField
		for _, field := range objectFields {
			if field.Name == object.CursorField.String {
				destinationCursorField = field
			}
		}

		for _, fieldMapping := range fieldMappings {
			if fieldMapping.DestinationFieldId == destinationCursorField.ID {
				return &fieldMapping.SourceFieldName
			}
		}
	}

	return nil
}
