package connectors

import (
	"context"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/models"
)

type Connector interface {
	Read(ctx context.Context, sourceConnection *models.Connection, sync *models.Sync, fieldMappings []models.FieldMapping) ([]data.Row, error)
	Write(
		ctx context.Context,
		destinationConnection *models.Connection,
		destination *models.DestinationConnection,
		object *models.Object,
		sync *models.Sync,
		objectFields []models.ObjectField,
		fieldMappings []models.FieldMapping,
		rows []data.Row,
	) error
}
