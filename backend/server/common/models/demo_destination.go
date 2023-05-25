package models

import "go.fabra.io/server/common/database"

type DemoDestination struct {
	OrganizationID  int64
	ConnectionID    int64               `json:"connection_id"`
	LastWrittenSync database.NullString `json:"last_written_sync"`

	BaseModel
}
