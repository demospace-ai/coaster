package connectors

import (
	"context"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/views"
)

const READ_BATCH_SIZE = 1_000_000

type DestinationOptions struct {
	StagingBucket string
}

type ReadOutput struct {
	CursorPosition *string
}

type WriteOutput struct {
	RowsWritten int
}

type Connector interface {
	Read(
		ctx context.Context,
		sourceConnection views.FullConnection,
		sync views.Sync,
		fieldMappings []views.FieldMapping,
		rowsC chan<- []data.Row,
		readOutputC chan<- ReadOutput,
		errC chan<- error,
	)
	Write(
		ctx context.Context,
		destinationConnection views.FullConnection,
		destinationOptions DestinationOptions,
		object views.Object,
		sync views.Sync,
		fieldMappings []views.FieldMapping,
		rowsC <-chan []data.Row,
		writeOutputC chan<- WriteOutput,
		errC chan<- error,
	)
}
