package temporal

import "os"

const SyncTaskQueue = "SYNC_TASK_QUEUE"

var HostPort = os.Getenv("TEMPORAL_CLUSTER_HOST") + ":7233"

type SyncConfiguration struct {
}

type SyncParams struct {
	syncID int64
}
