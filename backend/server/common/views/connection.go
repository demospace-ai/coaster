package views

import (
	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"
)

type Destination struct {
	ID            int64      `json:"id"`
	DisplayName   string     `json:"display_name"`
	Connection    Connection `json:"connection"`
	StagingBucket string     `json:"staging_bucket,omitempty"`
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

// Don't return this to the client except in special situations
type FullConnection struct {
	ID                int64                 `json:"id"`
	OrganizationID    int64                 `json:"organization_id"`
	ConnectionType    models.ConnectionType `json:"connection_type"`
	Credentials       string                `json:"credentials"`
	Username          string                `json:"username"`
	Password          string                `json:"password"`
	Location          string                `json:"location"`
	WarehouseName     string                `json:"warehouse_name"`
	DatabaseName      string                `json:"database_name"`
	Role              string                `json:"role"`
	Host              string                `json:"host"`
	Port              string                `json:"port"`
	ConnectionOptions string                `json:"connection_options"`
}

type Object struct {
	ID                 int64                 `json:"id"`
	DisplayName        string                `json:"display_name"`
	DestinationID      int64                 `json:"destination_id"`
	TargetType         models.TargetType     `json:"target_type"`
	Namespace          string                `json:"namespace,omitempty"`
	TableName          string                `json:"table_name,omitempty"`
	SyncMode           models.SyncMode       `json:"sync_mode"`
	CursorField        string                `json:"cursor_field,omitempty"`
	PrimaryKey         string                `json:"primary_key,omitempty"`
	EndCustomerIdField string                `json:"end_customer_id_field"`
	Frequency          int64                 `json:"frequency"`
	FrequencyUnits     models.FrequencyUnits `json:"frequency_units"`
	ObjectFields       []ObjectField         `json:"object_fields"`
}

type ObjectField struct {
	ID          int64          `json:"id"`
	Name        string         `json:"name"`
	Type        data.FieldType `json:"type"`
	DisplayName string         `json:"display_name,omitempty"`
	Description string         `json:"description,omitempty"`
	Omit        bool           `json:"omit"`
	Optional    bool           `json:"optional"`
}

func ConvertDestination(destination models.Destination, connection models.Connection) Destination {
	destinationView := Destination{
		ID:          destination.ID,
		DisplayName: destination.DisplayName,
		Connection: Connection{
			ID:             connection.ID,
			ConnectionType: connection.ConnectionType,
		},
	}

	if destination.StagingBucket.Valid {
		destinationView.StagingBucket = destination.StagingBucket.String
	}

	return destinationView
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

func ConvertObject(object *models.Object, objectFields []models.ObjectField) Object {
	viewObjectFields := []ObjectField{}
	for _, objectField := range objectFields {
		viewObjectField := ObjectField{
			ID:       objectField.ID,
			Name:     objectField.Name,
			Type:     objectField.Type,
			Omit:     objectField.Omit,
			Optional: objectField.Optional,
		}
		if objectField.DisplayName.Valid {
			viewObjectField.DisplayName = objectField.DisplayName.String
		}
		if objectField.Description.Valid {
			viewObjectField.Description = objectField.Description.String
		}
		viewObjectFields = append(viewObjectFields, viewObjectField)
	}

	viewObject := Object{
		ID:                 object.ID,
		DisplayName:        object.DisplayName,
		DestinationID:      object.DestinationID,
		TargetType:         object.TargetType,
		SyncMode:           object.SyncMode,
		EndCustomerIdField: object.EndCustomerIdField,
		Frequency:          object.Frequency,
		FrequencyUnits:     object.FrequencyUnits,
		ObjectFields:       viewObjectFields,
	}

	if object.Namespace.Valid {
		viewObject.Namespace = object.Namespace.String
	}

	if object.TableName.Valid {
		viewObject.TableName = object.TableName.String
	}

	if object.CursorField.Valid {
		viewObject.CursorField = object.CursorField.String
	}

	if object.PrimaryKey.Valid {
		viewObject.PrimaryKey = object.PrimaryKey.String
	}

	return viewObject
}

func ConvertFullConnection(connection *models.Connection) FullConnection {
	fullConnection := FullConnection{
		ID:             connection.ID,
		ConnectionType: connection.ConnectionType,
	}

	if connection.Credentials.Valid {
		fullConnection.Credentials = connection.Credentials.String
	}
	if connection.Username.Valid {
		fullConnection.Username = connection.Username.String
	}
	if connection.Password.Valid {
		fullConnection.Password = connection.Password.String
	}
	if connection.Location.Valid {
		fullConnection.Location = connection.Location.String
	}
	if connection.WarehouseName.Valid {
		fullConnection.WarehouseName = connection.WarehouseName.String
	}
	if connection.DatabaseName.Valid {
		fullConnection.DatabaseName = connection.DatabaseName.String
	}
	if connection.Role.Valid {
		fullConnection.Role = connection.Role.String
	}
	if connection.Host.Valid {
		fullConnection.Host = connection.Host.String
	}
	if connection.Port.Valid {
		fullConnection.Port = connection.Port.String
	}
	if connection.ConnectionOptions.Valid {
		fullConnection.ConnectionOptions = connection.ConnectionOptions.String
	}

	return fullConnection
}

func ConvertConnectionView(fullConnection FullConnection) *models.Connection {
	return &models.Connection{
		OrganizationID:    fullConnection.OrganizationID,
		ConnectionType:    fullConnection.ConnectionType,
		Credentials:       database.NewNullString(fullConnection.Credentials),
		Username:          database.NewNullString(fullConnection.Username),
		Password:          database.NewNullString(fullConnection.Password),
		Location:          database.NewNullString(fullConnection.Location),
		DatabaseName:      database.NewNullString(fullConnection.DatabaseName),
		WarehouseName:     database.NewNullString(fullConnection.WarehouseName),
		Role:              database.NewNullString(fullConnection.Role),
		Host:              database.NewNullString(fullConnection.Host),
		Port:              database.NewNullString(fullConnection.Port),
		ConnectionOptions: database.NewNullString(fullConnection.ConnectionOptions),
	}
}
