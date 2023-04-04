package connectors

import (
	"context"
	"fmt"
	"strings"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/views"
)

type SnowflakeImpl struct {
	queryService query.QueryService
}

func NewSnowflakeConnector(queryService query.QueryService) Connector {
	return SnowflakeImpl{
		queryService: queryService,
	}
}

func (sf SnowflakeImpl) Read(
	ctx context.Context,
	sourceConnection views.FullConnection,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC chan<- []data.Row,
	cursorPosC chan<- *string,
	errC chan<- error,
) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := sf.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		errC <- err
		return
	}

	sourceClient := sc.(query.SnowflakeApiClient)

	readQuery := sf.getReadQuery(connectionModel, sync, fieldMappings)

	iterator, err := sourceClient.GetQueryIterator(ctx, readQuery)
	if err != nil {
		errC <- errors.NewCustomerVisibleError(err)
		return
	}

	currentIndex := 0
	rowBatch := make([]data.Row, READ_BATCH_SIZE)
	var lastRow data.Row
	for {
		row, err := iterator.Next()
		if err != nil {
			if err == data.ErrDone {
				break
			} else {
				errC <- err
				return
			}
		}

		rowBatch[currentIndex] = row
		lastRow = row
		currentIndex++
		if currentIndex == READ_BATCH_SIZE {
			rowsC <- rowBatch
			currentIndex = 0
		}
	}

	newCursorPosition := sf.getNewCursorPosition(lastRow, iterator.Schema(), sync)
	cursorPosC <- newCursorPosition

	close(rowsC)
	close(cursorPosC)
	close(errC)
}

// TODO: only read 10,000 rows at once or something
func (sf SnowflakeImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	var queryString string
	if sync.CustomJoin != nil {
		queryString = *sync.CustomJoin
	} else {
		selectString := sf.getSelectString(fieldMappings)
		queryString = fmt.Sprintf("SELECT %s FROM %s.%s", selectString, *sync.Namespace, *sync.TableName)
	}

	if sync.SyncMode.UsesCursor() {
		if sync.CursorPosition != nil {
			// TODO: allow choosing other operators (rows smaller than current cursor)
			// order by cursor field to simplify
			return fmt.Sprintf("%s WHERE %s > %s ORDER BY %s ASC;", queryString, *sync.SourceCursorField, *sync.CursorPosition, *sync.SourceCursorField)
		} else {
			return fmt.Sprintf("%s ORDER BY %s ASC;", queryString, *sync.SourceCursorField)
		}
	} else {
		return fmt.Sprintf("%s;", queryString)
	}
}

func (sf SnowflakeImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	fields := []string{}
	for _, fieldMapping := range fieldMappings {
		fields = append(fields, fieldMapping.SourceFieldName)
	}

	return strings.Join(fields, ",")
}

func (sf SnowflakeImpl) getNewCursorPosition(lastRow data.Row, schema data.Schema, sync views.Sync) *string {
	if sync.SourceCursorField == nil {
		return nil
	}

	if lastRow == nil {
		return nil
	}

	var cursorFieldPos int
	for i := range schema {
		if schema[i].Name == *sync.SourceCursorField {
			cursorFieldPos = i
		}
	}

	// TODO: make sure we don't miss any rows
	// we sort rows by cursor field so just take the last row
	newCursorPos := lastRow[cursorFieldPos].(string)
	return &newCursorPos
}

func (sf SnowflakeImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC <-chan []data.Row,
	rowsWrittenC chan<- int,
	errC chan<- error,
) {
	errC <- errors.New("snowflake destination not implemented")
}
