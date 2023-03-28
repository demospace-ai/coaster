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

type ReplicateOutput struct {
	RowsWritten    int
	CursorPosition *string
}

type FormatToken struct {
	Format string
	Index  int
}

func Replicate(ctx context.Context, input ReplicateInput) (*ReplicateOutput, error) {
	db, err := database.InitDatabase()
	if err != nil {
		return nil, err
	}

	cryptoService := crypto.NewCryptoService()
	queryService := query.NewQueryService(db, cryptoService)

	var sourceConnector connectors.Connector
	switch input.SourceConnection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		sourceConnector = connectors.NewBigQueryConnector(queryService)
	case models.ConnectionTypeSnowflake:
		sourceConnector = connectors.NewSnowflakeConnector(queryService)
	case models.ConnectionTypeRedshift:
		sourceConnector = connectors.NewRedshiftConnector(queryService)
	default:
		return nil, errors.Newf("source not implemented for %s", input.SourceConnection.ConnectionType)
	}

	rows, cursorPosition, err := sourceConnector.Read(ctx, input.SourceConnection, input.Sync, input.FieldMappings)
	if err != nil {
		return nil, err
	}

	if len(rows) <= 0 {
		return &ReplicateOutput{
			RowsWritten: 0,
		}, nil
	}

	var destConnector connectors.Connector
	switch input.DestinationConnection.ConnectionType {
	case models.ConnectionTypeBigQuery:
		destConnector = connectors.NewBigQueryConnector(queryService)
	case models.ConnectionTypeWebhook:
		// TODO: does end customer api key belong here?
		destConnector = connectors.NewWebhookConnector(queryService, cryptoService, input.EncryptedEndCustomerApiKey)
	default:
		return nil, errors.Newf("destination not implemented for %s", input.SourceConnection.ConnectionType)
	}

	err = destConnector.Write(ctx, input.DestinationConnection, input.DestinationOptions, input.Object, input.Sync, input.FieldMappings, rows)
	if err != nil {
		return nil, err
	}

	return &ReplicateOutput{
		RowsWritten:    len(rows),
		CursorPosition: cursorPosition,
	}, nil
}
