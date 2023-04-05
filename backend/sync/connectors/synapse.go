package connectors

import (
	"context"
	"fmt"
	"strings"

	_ "github.com/microsoft/go-mssqldb"
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/views"
)

type SynapseImpl struct {
	queryService query.QueryService
}

func NewSynapseConnector(queryService query.QueryService) Connector {
	return SynapseImpl{
		queryService: queryService,
	}
}

func (as SynapseImpl) Read(
	ctx context.Context,
	sourceConnection views.FullConnection,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC chan<- []data.Row,
	readOutputC chan<- ReadOutput,
	errC chan<- error,
) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := as.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		errC <- err
		return
	}
	sourceClient := sc.(query.SynapseApiClient)

	readQuery := as.getReadQuery(connectionModel, sync, fieldMappings)

	iterator, err := sourceClient.GetQueryIterator(ctx, readQuery)
	if err != nil {
		errC <- errors.NewCustomerVisibleError(err)
		return
	}

	currentIndex := 0
	var rowBatch []data.Row
	var lastRow data.Row
	for {
		row, err := iterator.Next(ctx)
		if err != nil {
			if err == data.ErrDone {
				break
			} else {
				errC <- err
				return
			}
		}

		rowBatch = append(rowBatch, row)
		lastRow = row
		currentIndex++
		if currentIndex == READ_BATCH_SIZE {
			rowsC <- rowBatch
			currentIndex = 0
			rowBatch = []data.Row{}
		}
	}

	// write any remaining roows
	if currentIndex > 0 {
		rowsC <- rowBatch
	}

	newCursorPosition := as.getNewCursorPosition(lastRow, iterator.Schema(), sync)
	readOutputC <- ReadOutput{
		CursorPosition: newCursorPosition,
	}

	close(rowsC)
	close(errC)
}

// TODO: only read 10,000 rows at once or something
func (as SynapseImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	var queryString string
	if sync.CustomJoin != nil {
		queryString = *sync.CustomJoin
	} else {
		selectString := as.getSelectString(fieldMappings)
		queryString = fmt.Sprintf("SELECT %s FROM %s.%s", selectString, *sync.Namespace, *sync.TableName)
	}

	if sync.SyncMode.UsesCursor() {
		if sync.CursorPosition != nil {
			// TODO: allow choosing other operatoas (rows smaller than current cursor)
			// order by cursor field to simplify
			return fmt.Sprintf("%s WHERE %s > %s ORDER BY %s ASC;", queryString, *sync.SourceCursorField, *sync.CursorPosition, *sync.SourceCursorField)
		} else {
			return fmt.Sprintf("%s ORDER BY %s ASC;", queryString, *sync.SourceCursorField)
		}
	} else {
		return fmt.Sprintf("%s;", queryString)
	}
}

func (as SynapseImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	fields := []string{}
	for _, fieldMapping := range fieldMappings {
		fields = append(fields, fieldMapping.SourceFieldName)
	}

	return strings.Join(fields, ",")
}

func (as SynapseImpl) getNewCursorPosition(lastRow data.Row, schema data.Schema, sync views.Sync) *string {
	if sync.SourceCursorField == nil {
		return nil
	}

	if lastRow == nil {
		return nil
	}

	var cursorFieldPos int
	var cursorFieldType data.FieldType
	for i := range schema {
		if schema[i].Name == *sync.SourceCursorField {
			cursorFieldPos = i
			cursorFieldType = schema[i].Type
		}
	}

	// TODO: make sure we don't miss any rows
	// we sort rows by cursor field so just take the last row
	var newCursorPos string
	switch cursorFieldType {
	case data.FieldTypeInteger:
		newCursorPos = fmt.Sprintf("%v", lastRow[cursorFieldPos])
	default:
		newCursorPos = fmt.Sprintf("'%v'", lastRow[cursorFieldPos])
	}

	return &newCursorPos
}

func (as SynapseImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC <-chan []data.Row,
	writeOutputC chan<- WriteOutput,
	errC chan<- error,
) {
	errC <- errors.New("synapse destination not implemented")
}
