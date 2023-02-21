package temporal

import (
	"context"

	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
)

type ReplicateInput struct {
	queryService query.QueryService
	sync         SyncDetails
}

func Replicate(ctx context.Context, replicateInput ReplicateInput) error {
	queryString := getQueryStringForSource(replicateInput.sync.Source, replicateInput.sync.Sync)
	it, err := replicateInput.queryService.GetQueryIterator(ctx, replicateInput.sync.SourceConnection, queryString)
	if err != nil {
		return err
	}

	// TODO: batch insert 10,000 rows at a time
	// write to temporary table in destination
	for {
		row, err := it.Next()
		if err == query.ErrDone {
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

// TODO: only read 10,000 rows at once or something
func getQueryStringForSource(source *models.SourceConnection, sync *models.Sync) string {
	if source == nil {
		return "" // TODO: throw error
	}

	if sync.CustomJoin.Valid {
		return sync.CustomJoin.String
	}

	switch source.ConnectionType {
	case (models.ConnectionTypeBigQuery):
	case (models.ConnectionTypeSnowflake):
		return "SELECT * FROM " + sync.Namespace.String + "." + sync.TableName.String
	}

	return ""
}

func getTempInsertStringForModel(object *models.Object, destination *models.DestinationConnection) string {
	if object == nil || destination == nil {
		return "" // TODO: throw error
	}

	switch destination.ConnectionType {
	case (models.ConnectionTypeBigQuery):
	case (models.ConnectionTypeSnowflake):
		return "INSERT INTO " + getTempTableName(object.Namespace, object.TableName) + " SELECT * FROM VALUES\n"
	}

	return ""
}

func getTempTableName(namespace string, tableName string) string {
	return namespace + ".tmp_" + tableName
}

func getInsertStringForModel(object *models.Object, destination *models.DestinationConnection) string {
	if object == nil || destination == nil {
		return "" // TODO: throw error
	}

	switch destination.ConnectionType {
	case (models.ConnectionTypeBigQuery):
	case (models.ConnectionTypeSnowflake):
		return "INSERT INTO " + object.Namespace + "." + object.TableName + " SELECT * FROM VALUES\n"
	}

	return ""
}

func convertRowToValue(row query.Row) string {
	return "()"
}
