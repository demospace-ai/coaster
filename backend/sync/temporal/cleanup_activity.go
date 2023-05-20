package temporal

import (
	"context"

	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/sync_runs"
)

func (a *Activities) Cleanup(ctx context.Context, syncRun models.SyncRun) error {
	_, err := sync_runs.CancelSyncRun(a.Db, &syncRun)
	return err
}
