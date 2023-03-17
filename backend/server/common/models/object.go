package models

import "go.fabra.io/server/common/database"

type TargetType string

const (
	TargetTypeSingleExisting   SyncMode = "single_existing"
	TargetTypeTablePerCustomer SyncMode = "table_per_customer"
	TargetTypeWebhook          SyncMode = "webhook"
)

type Object struct {
	OrganizationID     int64               `json:"organization_id"`
	DisplayName        string              `json:"display_name"`
	DestinationID      int64               `json:"destination_id"`
	TargetType         TargetType          `json:"target_type"`
	Namespace          database.NullString `json:"namespace"`
	TableName          database.NullString `json:"table_name"`
	SyncMode           SyncMode            `json:"sync_mode"`
	CursorField        database.NullString `json:"cursor_field"` // used to determine rows to sync based on whether they changed e.g. updated_at
	PrimaryKey         database.NullString `json:"primary_key"`  // used to map updated rows to the row in the destination (only needed for updates)
	EndCustomerIdField string              `json:"end_customer_id_field"`
	Frequency          int64               `json:"frequency"`
	FrequencyUnits     FrequencyUnits      `json:"frequency_units"`

	BaseModel
}
