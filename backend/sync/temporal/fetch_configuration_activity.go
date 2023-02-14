package temporal

import (
	"context"

	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/customer_models"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/repositories/sync_configurations"
	"gorm.io/gorm"
)

type FetchConfigurationInput struct {
	db             *gorm.DB
	organizationID int64
	syncID         int64
}

func FetchConfiguration(ctx context.Context, input FetchConfigurationInput) (*SyncConfiguration, error) {
	syncConfiguration, err := sync_configurations.LoadSyncConfigurationByID(input.db, input.organizationID, input.syncID)
	if err != nil {
		return nil, err
	}

	source, err := sources.LoadSourceByID(input.db, input.organizationID, syncConfiguration.SourceID)
	if err != nil {
		return nil, err
	}

	sourceConnection, err := connections.LoadConnectionByID(input.db, input.organizationID, source.ConnectionID)
	if err != nil {
		return nil, err
	}

	destination, err := destinations.LoadDestinationByID(input.db, input.organizationID, syncConfiguration.DestinationID)
	if err != nil {
		return nil, err
	}

	destinationConnection, err := connections.LoadConnectionByID(input.db, input.organizationID, destination.ConnectionID)
	if err != nil {
		return nil, err
	}

	model, err := customer_models.LoadModelByID(input.db, input.organizationID, syncConfiguration.ModelID)
	if err != nil {
		return nil, err
	}

	return &SyncConfiguration{
		EndCustomerID:         syncConfiguration.EndCustomerID,
		Source:                source,
		SourceConnection:      sourceConnection,
		Destination:           destination,
		DestinationConnection: destinationConnection,
		Model:                 model,
	}, nil
}
