package views

import (
	"fabra/internal/models"
)

type Destination struct {
	DisplayName string     `json:"display_name"`
	Connection  Connection `json:"connection"`
}

type Source struct {
	DisplayName string
	Connection  Connection
	Namespace   string `json:"namespace"`
	TableName   string `json:"table_name"`
	CustomJoin  string `json:"custom_join"`
}

type Connection struct {
	ID             int64                 `json:"id"`
	ConnectionType models.ConnectionType `json:"connection_type"`
}

type Model struct {
	ID               int64        `json:"id"`
	DisplayName      string       `json:"display_name"`
	DestinationID    int64        `json:"destination_id"`
	Namespace        string       `json:"namespace"`
	TableName        string       `json:"table_name"`
	CustomJoin       string       `json:"custom_join"`
	CustomerIdColumn string       `json:"customer_id_column"`
	ModelFields      []ModelField `json:"model_fields"`
}

type ModelField struct {
	Name string
	Type string
}

func ConvertDestination(destination models.Destination, connection models.Connection) Destination {
	return Destination{
		DisplayName: destination.DisplayName,
		Connection: Connection{
			ID:             connection.ID,
			ConnectionType: connection.ConnectionType,
		},
	}
}

func ConvertDestinationConnections(destinationConnections []models.DestinationConnection) []Destination {
	var destinations []Destination
	for _, destinationConnection := range destinationConnections {
		destinations = append(destinations, Destination{
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
		DisplayName: source.DisplayName,
		Connection: Connection{
			ID:             connection.ID,
			ConnectionType: connection.ConnectionType,
		},
		Namespace:  source.Namespace.String,
		TableName:  source.TableName.String,
		CustomJoin: source.CustomJoin.String,
	}
}

func ConvertModel(model models.Model, modelFields []models.ModelField) Model {
	var viewModelFields []ModelField
	for _, modelField := range modelFields {
		viewModelFields = append(viewModelFields, ModelField{
			Name: modelField.Name,
			Type: modelField.Type,
		})
	}

	return Model{
		DisplayName:      model.DisplayName,
		DestinationID:    model.DestinationID,
		Namespace:        model.Namespace.String,
		TableName:        model.TableName.String,
		CustomJoin:       model.CustomJoin.String,
		CustomerIdColumn: model.CustomerIdColumn,
		ModelFields:      viewModelFields,
	}
}
