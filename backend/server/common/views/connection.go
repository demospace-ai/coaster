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
	ID                  int64         `json:"id"`
	DisplayName         string        `json:"display_name"`
	DestinationID       int64         `json:"destination_id"`
	Namespace           string        `json:"namespace"`
	TableName           string        `json:"table_name"`
	EndCustomerIdColumn string        `json:"end_customer_id_column"`
	ObjectFields        []ObjectField `json:"object_fields"`
}

type ObjectField struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	DisplayName string `json:"display_name,omitempty"`
	Description string `json:"description,omitempty"`
	Omit        bool   `json:"omit"`
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

func ConvertObject(object models.Object, objectFields []models.ObjectField) Object {
	viewObjectFields := []ObjectField{}
	for _, objectField := range objectFields {
		viewObjectField := ObjectField{
			Name: objectField.Name,
			Type: objectField.Type,
			Omit: objectField.Omit,
		}
		if objectField.DisplayName.Valid {
			viewObjectField.DisplayName = objectField.DisplayName.String
		}
		if objectField.Description.Valid {
			viewObjectField.Description = objectField.Description.String
		}
		viewObjectFields = append(viewObjectFields, viewObjectField)
	}

	return Object{
		ID:                  object.ID,
		DisplayName:         object.DisplayName,
		DestinationID:       object.DestinationID,
		Namespace:           object.Namespace,
		TableName:           object.TableName,
		EndCustomerIdColumn: object.EndCustomerIdColumn,
		ObjectFields:        viewObjectFields,
	}
}
