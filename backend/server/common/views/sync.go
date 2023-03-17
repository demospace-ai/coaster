package views

import (
	"time"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/models"
)

type Sync struct {
	ID             int64                 `json:"id"`
	OrganizationID int64                 `json:"organization_id"`
	EndCustomerID  int64                 `json:"end_customer_id"`
	DisplayName    string                `json:"display_name"`
	SourceID       int64                 `json:"source_id"`
	ObjectID       int64                 `json:"object_id"`
	Namespace      string                `json:"namespace,omitempty"`
	TableName      string                `json:"table_name,omitempty"`
	CustomJoin     string                `json:"custom_join,omitempty"`
	CursorField    string                `json:"cursor_field,omitempty"`
	PrimaryKey     string                `json:"primary_key,omitempty"`
	SyncMode       models.SyncMode       `json:"sync_mode"`
	Frequency      int64                 `json:"frequency"`
	FrequencyUnits models.FrequencyUnits `json:"frequency_units"`
}

type SyncRun struct {
	Status      models.SyncRunStatus `json:"status"`
	StartedAt   string               `json:"started_at"`
	CompletedAt string               `json:"completed_at"`
	Error       string               `json:"error,omitempty"`
}

type FieldMapping struct {
	SourceFieldName    string         `json:"source_field_name"`
	SourceFieldType    data.FieldType `json:"source_field_type"`
	DestinationFieldId int64          `json:"destination_field_id"`
}

func ConvertSync(sync *models.Sync) Sync {
	syncView := Sync{
		ID:             sync.ID,
		OrganizationID: sync.OrganizationID,
		EndCustomerID:  sync.EndCustomerID,
		DisplayName:    sync.DisplayName,
		SourceID:       sync.SourceID,
		ObjectID:       sync.ObjectID,
		SyncMode:       sync.SyncMode,
		Frequency:      sync.Frequency,
	}

	if sync.Namespace.Valid {
		syncView.Namespace = sync.Namespace.String
	}
	if sync.TableName.Valid {
		syncView.TableName = sync.TableName.String
	}
	if sync.CustomJoin.Valid {
		syncView.CustomJoin = sync.CustomJoin.String
	}
	if sync.CursorField.Valid {
		syncView.CursorField = sync.CursorField.String
	}
	if sync.PrimaryKey.Valid {
		syncView.PrimaryKey = sync.PrimaryKey.String
	}

	return syncView
}

func ConvertFieldMappings(fieldMappings []models.FieldMapping) []FieldMapping {
	var fieldMappingsView []FieldMapping
	for _, fieldMapping := range fieldMappings {
		fieldMappingsView = append(fieldMappingsView, FieldMapping{
			SourceFieldName:    fieldMapping.SourceFieldName,
			SourceFieldType:    fieldMapping.SourceFieldType,
			DestinationFieldId: fieldMapping.DestinationFieldId,
		})
	}

	return fieldMappingsView
}

func ConvertSyncRuns(syncRuns []models.SyncRun) []SyncRun {
	var syncRunsView []SyncRun
	for _, syncRun := range syncRuns {
		syncRunView := SyncRun{
			Status:      syncRun.Status,
			StartedAt:   syncRun.StartedAt.Format(time.RFC822),
			CompletedAt: syncRun.CompletedAt.Format(time.RFC822),
		}
		if syncRun.Error.Valid {
			syncRunView.Error = syncRun.Error.String
		}

		syncRunsView = append(syncRunsView, syncRunView)
	}

	return syncRunsView
}
