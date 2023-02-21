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
		Port:           database.NewNullString(redshiftConfig.Port),
		Host:           database.NewNullString(redshiftConfig.Host),
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
		OrganizationID:    organizationID,
		ConnectionType:    models.ConnectionTypeMongoDb,
		Username:          database.NewNullString(mongodbConfig.Username),
		Password:          database.NewNullString(encryptedPassword),
		Host:              database.NewNullString(mongodbConfig.Host),
		ConnectionOptions: database.NewNullString(mongodbConfig.ConnectionOptions),
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}
