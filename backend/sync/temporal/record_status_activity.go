package temporal

import (
	"context"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/sync_runs"
)

type UpdateType string

const (
	UpdateTypeCreate   UpdateType = "create"
	UpdateTypeComplete UpdateType = "complete"
)

type RecordStatusInput struct {
	OrganizationID int64
	SyncID         int64
	SyncRun        models.SyncRun
	UpdateType     UpdateType
	NewStatus      models.SyncRunStatus
	RowsWritten    int
	Error          *string
}

func RecordStatus(ctx context.Context, input RecordStatusInput) (*models.SyncRun, error) {
	db, err := database.InitDatabase()
	if err != nil {
		return nil, err
	}

	switch input.UpdateType {
	case UpdateTypeCreate:
		return sync_runs.CreateSyncRun(db, input.OrganizationID, input.SyncID)
	case UpdateTypeComplete:
		return sync_runs.CompleteSyncRun(db, &input.SyncRun, input.NewStatus, input.Error, input.RowsWritten)
	default:
		return nil, errors.Newf("unexpected update type: %s", input.UpdateType)
	}
}
