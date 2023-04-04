package temporal

import (
	"context"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/data"
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

	rowsC := make(chan []data.Row)
	cursorPositionC := make(chan *string)
	rowsWrittenC := make(chan int)
	readErrC := make(chan error)
	writeErrC := make(chan error)

	sourceConnector, err := getSourceConnector(input.SourceConnection.ConnectionType, queryService)
	if err != nil {
		return nil, err
	}

	destConnector, err := getDestinationConnector(input.DestinationConnection.ConnectionType, queryService, cryptoService, input.EncryptedEndCustomerApiKey)
	if err != nil {
		return nil, err
	}

	go sourceConnector.Read(ctx, input.SourceConnection, input.Sync, input.FieldMappings, rowsC, cursorPositionC, readErrC)
	go destConnector.Write(ctx, input.DestinationConnection, input.DestinationOptions, input.Object, input.Sync, input.FieldMappings, rowsC, rowsWrittenC, writeErrC)

	// wait for both error channels in any order, immediately exiting if an error is returned
	var cursorPosition *string
	var rowsWritten int
	var readErrReceived, writeErrReceived, cursorPositionReceived, rowsWrittenReceived bool
	for {
		if readErrReceived && writeErrReceived && cursorPositionReceived && rowsWrittenReceived {
			break
		}

		select {
		case err = <-readErrC:
			readErrReceived = true
			if err != nil {
				return nil, err
			}
		case err = <-writeErrC:
			writeErrReceived = true
			if err != nil {
				return nil, err
			}
		case cursorPosition = <-cursorPositionC:
			cursorPositionReceived = true
		case rowsWritten = <-rowsWrittenC:
			rowsWrittenReceived = true
		}
	}

	return &ReplicateOutput{
		RowsWritten:    rowsWritten,
		CursorPosition: cursorPosition,
	}, nil
}

func getSourceConnector(connectionType models.ConnectionType, queryService query.QueryService) (connectors.Connector, error) {
	switch connectionType {
	case models.ConnectionTypeBigQuery:
		return connectors.NewBigQueryConnector(queryService), nil
	case models.ConnectionTypeSnowflake:
		return connectors.NewSnowflakeConnector(queryService), nil
	case models.ConnectionTypeRedshift:
		return connectors.NewRedshiftConnector(queryService), nil
	default:
		return nil, errors.Newf("source not implemented for %s", connectionType)
	}
}

func getDestinationConnector(connectionType models.ConnectionType, queryService query.QueryService, cryptoService crypto.CryptoService, encryptedEndCustomerApiKey *string) (connectors.Connector, error) {
	switch connectionType {
	case models.ConnectionTypeBigQuery:
		return connectors.NewBigQueryConnector(queryService), nil
	case models.ConnectionTypeWebhook:
		// TODO: does end customer api key belong here?
		return connectors.NewWebhookConnector(queryService, cryptoService, encryptedEndCustomerApiKey), nil
	default:
		return nil, errors.Newf("destination not implemented for %s", connectionType)
	}
}
