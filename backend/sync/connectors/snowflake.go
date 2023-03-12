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

func (sf SnowflakeImpl) Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, error) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := sf.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		return nil, err
	}
	sourceClient := sc.(query.SnowflakeApiClient)

	readQuery := sf.getReadQuery(connectionModel, sync, fieldMappings)

	results, err := sourceClient.RunQuery(ctx, readQuery)
	if err != nil {
		return nil, err
	}

	return results.Data, nil
}

// TODO: only read 10,000 rows at once or something
func (sf SnowflakeImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	if len(sync.CustomJoin) > 0 {
		return sync.CustomJoin
	}

	selectString := sf.getSelectString(fieldMappings)
	return fmt.Sprintf("SELECT %s FROM %s.%s;", selectString, sync.Namespace, sync.TableName)
}

func (sf SnowflakeImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	columns := []string{}
	for _, fieldMapping := range fieldMappings {
		columns = append(columns, fieldMapping.SourceFieldName)
	}

	return strings.Join(columns, ",")
}

func (sf SnowflakeImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rows []data.Row,
) error {
	return errors.New("snowflake destination not implemented")
}
