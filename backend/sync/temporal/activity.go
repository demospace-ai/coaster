package temporal

import (
	"context"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/destinations"
	"go.fabra.io/server/common/repositories/objects"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/repositories/syncs"
	"go.fabra.io/sync/connectors"
)

const FABRA_STAGING_BUCKET = "fabra-staging"

type ReplicateInput struct {
	OrganizationID int64
	SyncID         int64
}

type FormatToken struct {
	Format string
	Index  int
}

func Replicate(ctx context.Context, input ReplicateInput) error {
	db, err := database.InitDatabase()
	if err != nil {
		return err
	}

	queryService := query.NewQueryService(db, crypto.NewCryptoService())

	sync, err := syncs.LoadSyncByID(db, input.OrganizationID, input.SyncID)
	if err != nil {
		return err
	}

	source, err := sources.LoadSourceByID(db, input.OrganizationID, sync.EndCustomerId, sync.SourceID)
	if err != nil {
		return err
	}

	sourceConnection, err := connections.LoadConnectionByID(db, input.OrganizationID, source.ConnectionID)
	if err != nil {
		return err
	}

	object, err := objects.LoadObjectByID(db, input.OrganizationID, sync.ObjectID)
	if err != nil {
		return err
	}

	destination, err := destinations.LoadDestinationByID(db, input.OrganizationID, object.DestinationID)
	if err != nil {
		return err
	}

	destinationConnection, err := connections.LoadConnectionByID(db, input.OrganizationID, destination.ConnectionID)
	if err != nil {
		return err
	}

	fieldMappings, err := syncs.LoadFieldMappingsForSync(db, input.SyncID)
	if err != nil {
		return err
	}

	objectFields, err := objects.LoadObjectFieldsByID(db, object.ID)
	if err != nil {
		return err
	}

	sourceConnector := connectors.NewBigQueryConnector(queryService)
	rows, err := sourceConnector.Read(ctx, sourceConnection, sync, fieldMappings)
	if err != nil {
		return err
	}

	destConnector := connectors.NewBigQueryConnector(queryService)
	return destConnector.Write(ctx, destinationConnection, destination, object, sync, objectFields, fieldMappings, rows)
}
