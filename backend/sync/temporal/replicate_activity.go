package temporal

import (
	"context"

	"go.fabra.io/server/common/query"
)

type ReplicateInput struct {
	queryService      query.QueryService
	syncConfiguration SyncConfiguration
}

func Replicate(ctx context.Context, replicateInput ReplicateInput) error {
	return nil
}
