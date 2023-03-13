package models

import (
	"time"

	"go.fabra.io/server/common/database"
)

type SyncRunStatus string

const (
	SyncRunStatusRunning   SyncRunStatus = "running"
	SyncRunStatusFailed    SyncRunStatus = "failed"
	SyncRunStatusCompleted SyncRunStatus = "completed"
)

type SyncRun struct {
	OrganizationID int64
	SyncID         int64               `json:"sync_id"`
	Status         SyncRunStatus       `json:"status"`
	Error          database.NullString `json:"error"`
	StartedAt      time.Time           `json:"started_at"`
	CompletedAt    time.Time           `json:"completed_at"`

	BaseModel
}
