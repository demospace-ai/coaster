package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/views"
	"go.fabra.io/sync/temporal"
	"go.temporal.io/sdk/client"

	"github.com/go-playground/validator/v10"
)

type CreateSyncLinkRequest struct {
	DisplayName    string                `json:"display_name"`
	SourceID       int64                 `json:"source_id"`
	ObjectID       int64                 `json:"object_id"`
	Namespace      *string               `json:"namespace,omitempty"`
	TableName      *string               `json:"table_name,omitempty"`
	CustomJoin     *string               `json:"custom_join,omitempty"`
	CursorField    *string               `json:"cursor_field,omitempty"`
	PrimaryKey     *string               `json:"primary_key,omitempty"`
	SyncMode       models.SyncMode       `json:"sync_mode"`
	Frequency      int64                 `json:"frequency"`
	FrequencyUnits models.FrequencyUnits `json:"frequency_units"`
	FieldMappings  []input.FieldMapping  `json:"field_mappings"`
}

func (s ApiService) LinkCreateSync(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	decoder := json.NewDecoder(r.Body)
	var createSyncRequest CreateSyncLinkRequest
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
		createSyncRequest.CursorField,
		createSyncRequest.PrimaryKey,
		createSyncRequest.SyncMode,
		createSyncRequest.Frequency,
		createSyncRequest.FrequencyUnits,
	)
	if err != nil {
		return err
	}

	// TODO: validate types are mapped correctly
	fieldMappings, err := syncs.CreateFieldMappings(
		s.db, auth.Organization.ID, sync.ID, createSyncRequest.FieldMappings,
	)
	if err != nil {
		return err
	}

	// TODO: use schedules instead of crons
	cronSchedule := createCronSchedule(createSyncRequest.Frequency, createSyncRequest.FrequencyUnits)

	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		return err
	}
	defer c.Close()

	ctx := context.TODO()
	workflow, err := c.ExecuteWorkflow(
		ctx,
		client.StartWorkflowOptions{
			ID:           sync.WorkflowID,
			TaskQueue:    temporal.SyncTaskQueue,
			CronSchedule: cronSchedule,
		},
		temporal.SyncWorkflow,
		temporal.SyncInput{SyncID: sync.ID, OrganizationID: auth.Organization.ID},
	)
	if err != nil {
		return err
	}

	// tell the workflow to run immediately
	_, err = c.SignalWithStartWorkflow(
		ctx,
		workflow.GetID(),
		"start",
		nil,
		client.StartWorkflowOptions{
			ID:        sync.WorkflowID,
			TaskQueue: temporal.SyncTaskQueue,
		},
		temporal.SyncWorkflow,
		temporal.SyncInput{SyncID: sync.ID, OrganizationID: auth.Organization.ID},
	)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(CreateSyncResponse{
		Sync:          views.ConvertSync(sync),
		FieldMappings: views.ConvertFieldMappings(fieldMappings),
	})
}

func createCronSchedule(frequency int64, frequencyUnits models.FrequencyUnits) string {
	// this uses the robfig format: https://docs.temporal.io/workflows#robfig-predefined-schedules-and-intervals
	switch frequencyUnits {
	case models.FrequencyUnitsMinutes:
		return fmt.Sprintf("@every %dm", frequency)
	case models.FrequencyUnitsHours:
		return fmt.Sprintf("@every %dh", frequency)
	case models.FrequencyUnitsDays:
		return fmt.Sprintf("@every %dh", frequency*24)
	case models.FrequencyUnitsWeeks:
		return fmt.Sprintf("@every %dh", frequency*24*7)
	default:
		return "0 0 0 0 2000" // choose a day in the past so it never executes
	}
}
