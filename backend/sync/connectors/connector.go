package connectors

import (
	"context"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/views"
)

type DestinationOptions struct {
	StagingBucket string
}

type Connector interface {
	Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, *string, error)
	Write(
		ctx context.Context,
		destinationConnection views.FullConnection,
		destinationOptions DestinationOptions,
		object views.Object,
		sync views.Sync,
		fieldMappings []views.FieldMapping,
		rows []data.Row,
	) error
}
