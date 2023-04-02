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

type RedshiftImpl struct {
	queryService query.QueryService
}

func NewRedshiftConnector(queryService query.QueryService) Connector {
	return RedshiftImpl{
		queryService: queryService,
	}
}

func (rs RedshiftImpl) Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, *string, error) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := rs.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		return nil, nil, err
	}
	sourceClient := sc.(query.RedshiftApiClient)

	readQuery := rs.getReadQuery(connectionModel, sync, fieldMappings)
	results, err := sourceClient.RunQuery(ctx, readQuery)
	if err != nil {
		return nil, nil, errors.NewCustomerVisibleError(err)
	}

	newCursorPosition := rs.getNewCursorPosition(results, sync)
	return results.Data, newCursorPosition, nil
}

// TODO: only read 10,000 rows at once or something
func (rs RedshiftImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	var queryString string
	if sync.CustomJoin != nil {
		queryString = *sync.CustomJoin
	} else {
		selectString := rs.getSelectString(fieldMappings)
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

func (rs RedshiftImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	fields := []string{}
	for _, fieldMapping := range fieldMappings {
		fields = append(fields, fieldMapping.SourceFieldName)
	}

	return strings.Join(fields, ",")
}

func (rs RedshiftImpl) getNewCursorPosition(results *data.QueryResults, sync views.Sync) *string {
	if sync.SourceCursorField == nil {
		return nil
	}

	if len(results.Data) <= 0 {
		return nil
	}

	var cursorFieldPos int
	for i := range results.Schema {
		if results.Schema[i].Name == *sync.SourceCursorField {
			cursorFieldPos = i
		}
	}

	// TODO: make sure we don't miss any rows
	// we sort rows by cursor field so just take the last row
	newCursorPos := results.Data[len(results.Data)-1][cursorFieldPos].(string)
	return &newCursorPos
}

func (rs RedshiftImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rows []data.Row,
) error {
	return errors.New("redshift destination not implemented")
}
