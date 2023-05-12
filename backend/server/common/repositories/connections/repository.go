package connections

import (
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func LoadDataConnections(db *gorm.DB, organizationID int64) ([]models.Connection, error) {
	var connections []models.Connection
	result := db.Table("connections").
		Select("connections.*").
		Where("connections.organization_id = ?", organizationID).
		Where("connections.deactivated_at IS NULL").
		Order("connections.created_at ASC").
		Find(&connections)

	if result.Error != nil {
		return nil, result.Error
	}

	return connections, nil
}

func LoadConnectionByID(db *gorm.DB, organizationID int64, connectionID int64) (*models.Connection, error) {
	var connection models.Connection
	result := db.Table("connections").
		Select("connections.*").
		Where("connections.id = ?", connectionID).
		Where("connections.organization_id = ?", organizationID).
		Where("connections.deactivated_at IS NULL").
		Take(&connection)

	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreateBigQueryConnection(db *gorm.DB, organizationID int64, encryptedCredentials string, location string) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeBigQuery,
		Credentials:    database.NewNullString(encryptedCredentials),
		Location:       database.NewNullString(location),
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreateSnowflakeConnection(
	db *gorm.DB,
	organizationID int64,
	snowflakeConfig input.SnowflakeConfig,
	encryptedPassword string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeSnowflake,
		Username:       database.NewNullString(snowflakeConfig.Username),
		Password:       database.NewNullString(encryptedPassword),
		DatabaseName:   database.NewNullString(snowflakeConfig.DatabaseName),
		WarehouseName:  database.NewNullString(snowflakeConfig.WarehouseName),
		Role:           database.NewNullString(snowflakeConfig.Role),
		Host:           database.NewNullString(snowflakeConfig.Host),
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreateRedshiftConnection(
	db *gorm.DB,
	organizationID int64,
	redshiftConfig input.RedshiftConfig,
	encryptedPassword string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeRedshift,
		Username:       database.NewNullString(redshiftConfig.Username),
		Password:       database.NewNullString(encryptedPassword),
		DatabaseName:   database.NewNullString(redshiftConfig.DatabaseName),
		Host:           database.NewNullString(redshiftConfig.Endpoint), // we just use the host field to store the whole endpoint (including port)
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreateMongoDbConnection(
	db *gorm.DB,
	organizationID int64,
	mongodbConfig input.MongoDbConfig,
	encryptedPassword string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeMongoDb,
		Username:       database.NewNullString(mongodbConfig.Username),
		Password:       database.NewNullString(encryptedPassword),
		Host:           database.NewNullString(mongodbConfig.Host),
	}

	if mongodbConfig.ConnectionOptions != nil {
		connection.ConnectionOptions = database.NewNullString(*mongodbConfig.ConnectionOptions)
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreateSynapseConnection(
	db *gorm.DB,
	organizationID int64,
	synapseConfig input.SynapseConfig,
	encryptedPassword string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeSynapse,
		Username:       database.NewNullString(synapseConfig.Username),
		Password:       database.NewNullString(encryptedPassword),
		DatabaseName:   database.NewNullString(synapseConfig.DatabaseName),
		Host:           database.NewNullString(synapseConfig.Endpoint), // we just use the host field to store the endpoint
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreatePostgresConnection(
	db *gorm.DB,
	organizationID int64,
	postgresConfig input.PostgresConfig,
	encryptedPassword string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypePostgres,
		Username:       database.NewNullString(postgresConfig.Username),
		Password:       database.NewNullString(encryptedPassword),
		DatabaseName:   database.NewNullString(postgresConfig.DatabaseName),
		Host:           database.NewNullString(postgresConfig.Endpoint), // we just use the host field to store the endpoint
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}

func CreateWebhookConnection(
	db *gorm.DB,
	organizationID int64,
	webhookConfig input.WebhookConfig,
	encryptedSigningKey string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeWebhook,
		Host:           database.NewNullString(webhookConfig.URL),   // store URL in the host column
		Credentials:    database.NewNullString(encryptedSigningKey), // store signing key in the credentials column
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}
