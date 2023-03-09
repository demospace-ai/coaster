package api

import (
	"context"
	"encoding/json"
	"log"
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

const CLIENT_PEM_KEY = "projects/932264813910/secrets/temporal-client-pem/versions/latest"
const CLIENT_KEY_KEY = "projects/932264813910/secrets/temporal-client-key/versions/latest"

type CreateSyncRequest struct {
	DisplayName    string                `json:"display_name"`
	EndCustomerId  int64                 `json:"end_customer_id"`
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

	// TODO: create sync schedule in Temporal
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
		createSyncRequest.CursorField,
		createSyncRequest.PrimaryKey,
		createSyncRequest.SyncMode,
		createSyncRequest.Frequency,
		createSyncRequest.FrequencyUnits,
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

	// TODO: do this on a schedule
	c, err := temporal.CreateClient(CLIENT_PEM_KEY, CLIENT_KEY_KEY)
	if err != nil {
		log.Fatalln("unable to create Temporal client", err)
	}
	defer c.Close()

	ctx := context.TODO()
	c.ExecuteWorkflow(
		ctx,
		client.StartWorkflowOptions{
			TaskQueue:    temporal.SyncTaskQueue,
			CronSchedule: "0 0 * * *",
		},
		temporal.SyncWorkflow,
		temporal.SyncInput{SyncID: sync.ID, OrganizationID: auth.Organization.ID},
	)

	return json.NewEncoder(w).Encode(CreateSyncResponse{
		Sync:          views.ConvertSync(sync),
		FieldMappings: views.ConvertFieldMappings(fieldMappings),
	})
}
