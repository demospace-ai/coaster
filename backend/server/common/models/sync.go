package models

import "go.fabra.io/server/common/database"

type SyncMode string

const (
	SyncModeFullRefresh SyncMode = "full_refresh"
	SyncModeIncremental SyncMode = "incremental"
)

type Sync struct {
	OrganizationID int64
	DisplayName    string              `json:"display_name"`
	DestinationID  int64               `json:"destination_id"`
	SourceID       int64               `json:"source_id"`
	ObjectID       int64               `json:"object_id"`
	SyncMode       SyncMode            `json:"sync_mode"`
	Frequency      int64               `json:"frequency"`
	Namespace      database.NullString `json:"namespace"`
	TableName      database.NullString `json:"table_name"`
	CustomJoin     database.NullString `json:"custom_join"`
	CursorField    database.NullString `json:"cursor_field"` // used to determine rows to sync based on whether they changed e.g. updated_at
	PrimaryKey     database.NullString `json:"primary_key"`  // used to map updated rows to the row in the destination (only needed for updates)
	Cursor         database.NullString `json:"cursor"`       // current value of the cursor to determine where to start a sync from

	BaseModel
}
