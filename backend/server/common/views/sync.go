package views

import "go.fabra.io/server/common/models"

type Sync struct {
	ID             int64               `json:"id"`
	OrganizationID int64               `json:"organization_id"`
	DisplayName    string              `json:"display_name"`
	DestinationID  int64               `json:"destination_id"`
	SourceID       int64               `json:"source_id"`
	ObjectID       int64               `json:"object_id"`
	Namespace      string              `json:"namespace,omitempty"`
	TableName      string              `json:"table_name,omitempty"`
	CustomJoin     string              `json:"custom_join,omitempty"`
	CursorField    string              `json:"cursor_field,omitempty"`
	PrimaryKey     string              `json:"primary_key,omitempty"`
	SyncMode       models.SyncMode     `json:"sync_mode"`
	Frequency      int64               `json:"frequency"`
	FieldMappings  []SyncFieldMappings `json:"field_mappings"`
}

type SyncFieldMappings struct {
	SourceFieldName      string `json:"source_field_name"`
	DestinationFieldName string `json:"destination_field_name"`
}

func ConvertSync(sync *models.Sync, fieldMappings []models.SyncFieldMapping) Sync {
	syncView := Sync{
		ID:            sync.ID,
		DisplayName:   sync.DisplayName,
		DestinationID: sync.DestinationID,
		SourceID:      sync.SourceID,
		ObjectID:      sync.ObjectID,
		SyncMode:      sync.SyncMode,
		Frequency:     sync.Frequency,
	}

	var fieldMappingsView []SyncFieldMappings
	for _, fieldMapping := range fieldMappings {
		fieldMappingsView = append(fieldMappingsView, SyncFieldMappings{
			SourceFieldName:      fieldMapping.SourceFieldName,
			DestinationFieldName: fieldMapping.DestinationFieldName,
		})
	}

	syncView.FieldMappings = fieldMappingsView

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
