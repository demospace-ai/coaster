package temporal

import (
	"context"

	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
)

type ReplicateInput struct {
	queryService      query.QueryService
	syncConfiguration SyncConfiguration
}

func Replicate(ctx context.Context, replicateInput ReplicateInput) error {
	queryString := getQueryStringForSource(replicateInput.syncConfiguration.Source)
	it, err := replicateInput.queryService.GetQueryIterator(ctx, replicateInput.syncConfiguration.SourceConnection, queryString)
	if err != nil {
		return err
	}

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	for {
		row, err := it.Next()
		if err == query.Done {
			break
		}

		if err != nil {
			return err
		}

		// TODO
		convertRowToValue(row)

	}

	// copy from temporary table into dest table
	// delete all old data, then insert new data

	// delete temporary table

	return nil
}

func getQueryStringForSource(source *models.SourceConnection) string {
	if source == nil {
		return "" // TODO: throw error
	}

	if source.CustomJoin.Valid {
		return source.CustomJoin.String
	}

	switch source.ConnectionType {
	case (models.ConnectionTypeBigQuery):
	case (models.ConnectionTypeSnowflake):
		return "SELECT * FROM " + source.Namespace.String + "." + source.TableName.String
	}

	return ""
}

func getInsertStringForModel(model *models.Model, destination *models.DestinationConnection) string {
	if model == nil || destination == nil {
		return "" // TODO: throw error
	}

	switch destination.ConnectionType {
	case (models.ConnectionTypeBigQuery):
	case (models.ConnectionTypeSnowflake):
		return "INSERT INTO " + model.Namespace + "." + model.TableName + " SELECT * FROM VALUES\n"
	}

	return ""
}

func convertRowToValue(row query.Row) string {
	return "()"
}
