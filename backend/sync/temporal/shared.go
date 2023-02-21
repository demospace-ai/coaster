package temporal

import (
	"os"

	"go.fabra.io/server/common/models"
)

const SyncTaskQueue = "SYNC_TASK_QUEUE"

var HostPort = os.Getenv("TEMPORAL_CLUSTER_HOST") + ":7233"

type SyncDetails struct {
	Sync                  *models.Sync
	Source                *models.SourceConnection
	SourceConnection      *models.Connection
	Destination           *models.DestinationConnection
	DestinationConnection *models.Connection
	Object                *models.Object
}
