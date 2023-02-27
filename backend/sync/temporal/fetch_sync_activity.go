package temporal

import (
	"context"

	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/repositories/syncs"
	"gorm.io/gorm"
)

type FetchConfigurationInput struct {
	db             *gorm.DB
	organizationID int64
	syncID         int64
}

func FetchConfiguration(ctx context.Context, input FetchConfigurationInput) (*SyncDetails, error) {
	sync, err := syncs.LoadSyncByID(input.db, input.organizationID, input.syncID)
	if err != nil {
		return nil, err
	}

	source, err := sources.LoadSourceByID(input.db, input.organizationID, sync.EndCustomerId, sync.SourceID)
	if err != nil {
		return nil, err
	}

	sourceConnection, err := connections.LoadConnectionByID(input.db, input.organizationID, source.ConnectionID)
	if err != nil {
		return nil, err
	}

	object, err := objects.LoadObjectByID(input.db, input.organizationID, sync.ObjectID)
	if err != nil {
		return nil, err
	}

	destination, err := destinations.LoadDestinationByID(input.db, input.organizationID, object.DestinationID)
	if err != nil {
		return nil, err
	}

	destinationConnection, err := connections.LoadConnectionByID(input.db, input.organizationID, destination.ConnectionID)
	if err != nil {
		return nil, err
	}

	return &SyncDetails{
		Sync:                  sync,
		Source:                source,
		SourceConnection:      sourceConnection,
		Destination:           destination,
		DestinationConnection: destinationConnection,
		Object:                object,
	}, nil
}
