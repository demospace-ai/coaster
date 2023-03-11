package temporal

import (
	"context"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/query"
	"go.fabra.io/sync/connectors"
)

const FABRA_STAGING_BUCKET = "fabra-staging"

type ReplicateInput = SyncConfig

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

	sourceConnector := connectors.NewBigQueryConnector(queryService)
	rows, err := sourceConnector.Read(ctx, input.SourceConnection, input.Sync, input.FieldMappings)
	if err != nil {
		return err
	}

	destConnector := connectors.NewBigQueryConnector(queryService)
	return destConnector.Write(ctx, input.DestinationConnection, input.DestinationOptions, input.Object, input.Sync, input.FieldMappings, rows)
}
