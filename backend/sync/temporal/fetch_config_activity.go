package temporal

import (
	"context"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/server/common/views"
	"go.fabra.io/sync/connectors"
)

type FetchConfigInput struct {
	OrganizationID int64
	SyncID         int64
}

type SyncConfig struct {
	Sync                  views.Sync
	SourceConnection      views.FullConnection
	DestinationConnection views.FullConnection
	DestinationOptions    connectors.DestinationOptions
	Object                views.Object
	ObjectFields          []views.ObjectField
	FieldMappings         []views.FieldMapping
}

func FetchConfig(ctx context.Context, input FetchConfigInput) (*SyncConfig, error) {
	db, err := database.InitDatabase()
	if err != nil {
		return nil, err
	}

	sync, err := syncs.LoadSyncByID(db, input.OrganizationID, input.SyncID)
	if err != nil {
		return nil, err
	}

	source, err := sources.LoadSourceByID(db, input.OrganizationID, sync.EndCustomerID, sync.SourceID)
	if err != nil {
		return nil, err
	}

	sourceConnection, err := connections.LoadConnectionByID(db, input.OrganizationID, source.ConnectionID)
	if err != nil {
		return nil, err
	}

	object, err := objects.LoadObjectByID(db, input.OrganizationID, sync.ObjectID)
	if err != nil {
		return nil, err
	}

	destination, err := destinations.LoadDestinationByID(db, input.OrganizationID, object.DestinationID)
	if err != nil {
		return nil, err
	}

	destinationConnection, err := connections.LoadConnectionByID(db, input.OrganizationID, destination.ConnectionID)
	if err != nil {
		return nil, err
	}

	fieldMappings, err := syncs.LoadFieldMappingsForSync(db, input.SyncID)
	if err != nil {
		return nil, err
	}

	objectFields, err := objects.LoadObjectFieldsByID(db, object.ID)
	if err != nil {
		return nil, err
	}

	// TODO: encrypt this value before returning it, even though the credentials are already encrypted
	syncConfig := SyncConfig{
		Sync:                  views.ConvertSync(sync),
		SourceConnection:      views.ConvertFullConnection(sourceConnection),
		DestinationConnection: views.ConvertFullConnection(destinationConnection),
		DestinationOptions:    connectors.DestinationOptions{},
		Object:                views.ConvertObject(object, objectFields),
		FieldMappings:         views.ConvertFieldMappings(fieldMappings),
	}

	if destination.StagingBucket.Valid {
		syncConfig.DestinationOptions.StagingBucket = destination.StagingBucket.String
	}

	return &syncConfig, nil
}
