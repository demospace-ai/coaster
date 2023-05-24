package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

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

const DAY = time.Hour * 24
const WEEK = DAY * 7

type CreateSyncLinkRequest struct {
	DisplayName       string                 `json:"display_name"`
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

func (s ApiService) LinkCreateSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.Wrap(errors.NewBadRequest("must setup organization first"), "(api.LinkCreateSync)")
	}

	if auth.LinkToken == nil {
		return errors.Wrap(errors.NewBadRequest("must send link token"), "(api.LinkCreateSync)")
	}

	decoder := json.NewDecoder(r.Body)
	var createSyncRequest CreateSyncLinkRequest
	err := decoder.Decode(&createSyncRequest)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	// TODO: validate connection parameters
	validate := validator.New()
	err = validate.Struct(createSyncRequest)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	if (createSyncRequest.TableName == nil || createSyncRequest.Namespace == nil) && createSyncRequest.CustomJoin == nil {
		return errors.Wrap(errors.NewBadRequest("must have table_name and namespace or custom_join"), "(api.LinkCreateSync)")
	}

	// this also serves to check that this organization owns the object
	object, err := objects.LoadObjectByID(s.db, auth.Organization.ID, createSyncRequest.ObjectID)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	objectFields, err := objects.LoadObjectFieldsByID(s.db, createSyncRequest.ObjectID)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
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

	// TODO: create sync schedule in Temporal
	// TODO: create field mappings in DB using transaction
	// TODO: validate types are mapped correctly
	sync, err := syncs.CreateSync(
		s.db,
		auth.Organization.ID,
		createSyncRequest.DisplayName,
		auth.LinkToken.EndCustomerID,
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
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	// TODO: validate types are mapped correctly
	fieldMappings, err := syncs.CreateFieldMappings(
		s.db, auth.Organization.ID, sync.ID, createSyncRequest.FieldMappings,
	)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}
	defer c.Close()

	ctx := context.TODO()
	scheduleClient := c.ScheduleClient()
	schedule, err := createSchedule(frequency, frequencyUnits)
	if err != nil {
		return errors.Wrap(err, "(api.LinkCreateSync)")
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
		return errors.Wrap(err, "(api.LinkCreateSync)")
	}

	return json.NewEncoder(w).Encode(CreateSyncResponse{
		Sync:          views.ConvertSync(sync),
		FieldMappings: views.ConvertFieldMappings(fieldMappings),
	})
}

func createSchedule(frequency int64, frequencyUnits models.FrequencyUnits) (time.Duration, error) {
	frequencyDuration := time.Duration(frequency)
	switch frequencyUnits {
	case models.FrequencyUnitsMinutes:
		return frequencyDuration * time.Minute, nil
	case models.FrequencyUnitsHours:
		return frequencyDuration * time.Hour, nil
	case models.FrequencyUnitsDays:
		return frequencyDuration * DAY, nil
	case models.FrequencyUnitsWeeks:
		return frequencyDuration * WEEK, nil
	default:
		// TODO: this should not happen
		return WEEK, errors.Newf("(api.createSchedule) unexpected frequency unit: %s", string(frequencyUnits))
	}
}
