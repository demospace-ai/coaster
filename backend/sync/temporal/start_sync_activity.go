package temporal

import (
	"context"

	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/sync_runs"
	"go.fabra.io/server/common/repositories/syncs"
)

type StartSyncInput struct {
	OrganizationID int64
	SyncID         int64
}

func (a *Activities) StartSync(ctx context.Context, input StartSyncInput) (*models.SyncRun, error) {
	sync, err := syncs.LoadSyncByID(a.Db, input.OrganizationID, input.SyncID)
	if err != nil {
		return nil, err
	}

	// Find existing queued sync runs
	existingSyncRuns, err := sync_runs.LoadQueuedOrStartedRunsForSync(a.Db, input.OrganizationID, sync.ID)
	if err != nil {
		return nil, err
	}

	// If there aren't any existing ones, create one
	if len(existingSyncRuns) == 0 {
		syncRun, err := sync_runs.QueueAndStartSyncRun(a.Db, input.OrganizationID, sync.ID)
		if err != nil {
			return nil, err
		}

		return syncRun, nil
	} else {
		// If there are existing ones, just return the first one
		syncRun := existingSyncRuns[0]
		return &syncRun, nil
	}

}
