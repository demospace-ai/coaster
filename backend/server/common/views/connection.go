package views

import (
	"go.fabra.io/server/common/models"
)

type Destination struct {
	ID          int64      `json:"id"`
	DisplayName string     `json:"display_name"`
	Connection  Connection `json:"connection"`
}

type Source struct {
	ID            int64      `json:"id"`
	DisplayName   string     `json:"display_name"`
	EndCustomerId int64      `json:"end_customer_id"`
	Connection    Connection `json:"connection"`
}

type Connection struct {
	ID             int64                 `json:"id"`
	ConnectionType models.ConnectionType `json:"connection_type"`
}

type Object struct {
	ID               int64         `json:"id"`
	DisplayName      string        `json:"display_name"`
	DestinationID    int64         `json:"destination_id"`
	Namespace        string        `json:"namespace"`
	TableName        string        `json:"table_name"`
	CustomerIdColumn string        `json:"customer_id_column"`
	ObjectFields     []ObjectField `json:"object_fields"`
}

type ObjectField struct {
	Name string
	Type string
}

func ConvertDestination(destination models.Destination, connection models.Connection) Destination {
	return Destination{
		ID:          destination.ID,
		DisplayName: destination.DisplayName,
		Connection: Connection{
			ID:             connection.ID,
			ConnectionType: connection.ConnectionType,
		},
	}
}

func ConvertDestinationConnections(destinationConnections []models.DestinationConnection) []Destination {
	destinations := []Destination{}
	for _, destinationConnection := range destinationConnections {
		destinations = append(destinations, Destination{
			ID:          destinationConnection.ID,
			DisplayName: destinationConnection.DisplayName,
			Connection: Connection{
				ID:             destinationConnection.ConnectionID,
				ConnectionType: destinationConnection.ConnectionType,
			},
		})
	}

	return destinations
}

func ConvertSource(source models.Source, connection models.Connection) Source {
	return Source{
		ID:            source.ID,
		DisplayName:   source.DisplayName,
		EndCustomerId: source.EndCustomerID,
		Connection: Connection{
			ID:             connection.ID,
			ConnectionType: connection.ConnectionType,
		},
	}
}

func ConvertSourceConnections(sourceConnections []models.SourceConnection) []Source {
	sources := []Source{}
	for _, sourceConnection := range sourceConnections {
		sources = append(sources, Source{
			ID:            sourceConnection.ID,
			DisplayName:   sourceConnection.DisplayName,
			EndCustomerId: sourceConnection.EndCustomerID,
			Connection: Connection{
				ID:             sourceConnection.ConnectionID,
				ConnectionType: sourceConnection.ConnectionType,
			},
		})
	}

	return sources
}

func ConvertObject(model models.Object, objectFields []models.ObjectField) Object {
	viewObjectFields := []ObjectField{}
	for _, modelField := range objectFields {
		viewObjectFields = append(viewObjectFields, ObjectField{
			Name: modelField.Name,
			Type: modelField.Type,
		})
	}

	return Object{
		ID:               model.ID,
		DisplayName:      model.DisplayName,
		DestinationID:    model.DestinationID,
		Namespace:        model.Namespace,
		TableName:        model.TableName,
		CustomerIdColumn: model.CustomerIdColumn,
		ObjectFields:     viewObjectFields,
	}
}
