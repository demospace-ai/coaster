package connections

import (
	"fabra/internal/database"
	"fabra/internal/input"
	"fabra/internal/models"

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

func CreateBigQueryConnection(db *gorm.DB, organizationID int64, displayName string, encryptedCredentials string) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionType: models.ConnectionTypeBigQuery,
		Credentials:    database.NewNullString(encryptedCredentials),
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
	displayName string,
	snowflakeConfig input.SnowflakeConfig,
	encryptedPassword string,
) (*models.Connection, error) {
	connection := models.Connection{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionType: models.ConnectionTypeSnowflake,
		Username:       database.NewNullString(snowflakeConfig.Username),
		Password:       database.NewNullString(encryptedPassword),
		DatabaseName:   database.NewNullString(snowflakeConfig.DatabaseName),
		WarehouseName:  database.NewNullString(snowflakeConfig.WarehouseName),
		Role:           database.NewNullString(snowflakeConfig.Role),
		Account:        database.NewNullString(snowflakeConfig.Account),
	}

	result := db.Create(&connection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &connection, nil
}
