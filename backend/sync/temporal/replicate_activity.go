package temporal

import (
	"context"
	"time"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/sync/connectors"
	"go.temporal.io/sdk/activity"
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
	readOutputC := make(chan connectors.ReadOutput)
	writeOutputC := make(chan connectors.WriteOutput)
	readErrC := make(chan error)
	writeErrC := make(chan error)
	doneC := make(chan bool)

	sourceConnector, err := getSourceConnector(input.SourceConnection.ConnectionType, queryService)
	if err != nil {
		return nil, err
	}

	destConnector, err := getDestinationConnector(input.DestinationConnection.ConnectionType, queryService, cryptoService, input.EncryptedEndCustomerApiKey)
	if err != nil {
		return nil, err
	}

	go sourceConnector.Read(ctx, input.SourceConnection, input.Sync, input.FieldMappings, rowsC, readOutputC, readErrC)
	go destConnector.Write(ctx, input.DestinationConnection, input.DestinationOptions, input.Object, input.Sync, input.FieldMappings, rowsC, writeOutputC, writeErrC)
	go heartbeat(ctx, doneC) // TODO: heartbeat from the write/read methods to ensure the worker is making progress

	var readOutput connectors.ReadOutput
	var writeOutput connectors.WriteOutput
	var readDone, writeDone bool
	for {
		if readDone && writeDone {
			break
		}

		// wait for both error channels in any order, immediately exiting if an error is returned
		select {
		case err = <-readErrC:
			if err != nil {
				return nil, err
			}
		case err = <-writeErrC:
			if err != nil {
				return nil, err
			}
		case readOutput = <-readOutputC:
			readDone = true
		case writeOutput = <-writeOutputC:
			writeDone = true
		}
	}

	// signal the heartbeat worker that the replication is finished
	doneC <- true

	return &ReplicateOutput{
		RowsWritten:    writeOutput.RowsWritten,
		CursorPosition: readOutput.CursorPosition,
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
	case models.ConnectionTypeSynapse:
		return connectors.NewSynapseConnector(queryService), nil
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

func heartbeat(ctx context.Context, doneC <-chan bool) {
	timeChan := time.NewTicker(time.Minute).C
	for {
		activity.RecordHeartbeat(ctx)
		select {
		case <-doneC:
			return
		case <-timeChan:
			continue
		}
	}
}
