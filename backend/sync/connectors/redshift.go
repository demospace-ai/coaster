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

func (rs RedshiftImpl) Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, error) {
	connectionModel := views.ConvertConnectionView(sourceConnection)

	sc, err := rs.queryService.GetClient(ctx, connectionModel)
	if err != nil {
		return nil, err
	}
	sourceClient := sc.(query.RedshiftApiClient)

	readQuery := rs.getReadQuery(connectionModel, sync, fieldMappings)

	results, err := sourceClient.RunQuery(ctx, readQuery)
	if err != nil {
		return nil, err
	}

	return results.Data, nil
}

// TODO: only read 10,000 rows at once or something
func (rs RedshiftImpl) getReadQuery(sourceConnection *models.Connection, sync views.Sync, fieldMappings []views.FieldMapping) string {
	if len(sync.CustomJoin) > 0 {
		return sync.CustomJoin
	}

	selectString := rs.getSelectString(fieldMappings)
	return fmt.Sprintf("SELECT %s FROM %s.%s;", selectString, sync.Namespace, sync.TableName)
}

func (rs RedshiftImpl) getSelectString(fieldMappings []views.FieldMapping) string {
	fields := []string{}
	for _, fieldMapping := range fieldMappings {
		fields = append(fields, fieldMapping.SourceFieldName)
	}

	return strings.Join(fields, ",")
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
