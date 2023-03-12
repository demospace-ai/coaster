package temporal

import (
	"context"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
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

	var sourceConnector connectors.Connector
	switch input.SourceConnection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		sourceConnector = connectors.NewBigQueryConnector(queryService)
	case models.ConnectionTypeSnowflake:
		sourceConnector = connectors.NewBigQueryConnector(queryService)
	default:
		return errors.Newf("source not implemented for %s", input.SourceConnection.ConnectionType)
	}

	rows, err := sourceConnector.Read(ctx, input.SourceConnection, input.Sync, input.FieldMappings)
	if err != nil {
		return err
	}

	var destConnector connectors.Connector
	switch input.SourceConnection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		destConnector = connectors.NewBigQueryConnector(queryService)
	default:
		return errors.Newf("source not implemented for %s", input.SourceConnection.ConnectionType)
	}

	return destConnector.Write(ctx, input.DestinationConnection, input.DestinationOptions, input.Object, input.Sync, input.FieldMappings, rows)
}
