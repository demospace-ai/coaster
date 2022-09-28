package dataconnections

import (
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func LoadAllDataConnections(db *gorm.DB, organizationID int64) ([]models.DataConnection, error) {
	var connections []models.DataConnection
	result := db.Table("data_connections").
		Select("data_connections.*").
		Where("data_connections.organization_id = ?", organizationID).
		Where("data_connections.deactivated_at IS NULL").
		Order("data_connections.created_at ASC").
		Find(&connections)

	if result.Error != nil {
		return nil, result.Error
	}

	return connections, nil
}

func LoadDataConnectionByID(db *gorm.DB, organizationID int64, connectionID int64) (*models.DataConnection, error) {
	var dataConnection models.DataConnection
	result := db.Table("data_connections").
		Select("data_connections.*").
		Where("data_connections.id = ?", connectionID).
		Where("data_connections.organization_id = ?", organizationID).
		Where("data_connections.deactivated_at IS NULL").
		Take(&dataConnection)

	if result.Error != nil {
		return nil, result.Error
	}

	return &dataConnection, nil
}

func CreateBigQueryDataConnection(db *gorm.DB, organizationID int64, displayName string, encryptedCredentials string) (*models.DataConnection, error) {
	dataConnection := models.DataConnection{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionType: models.DataConnectionTypeBigQuery,
		Credentials:    database.NewNullString(encryptedCredentials),
	}

	result := db.Create(&dataConnection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &dataConnection, nil
}

func CreateSnowflakeDataConnection(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	username string,
	encryptedPassword string,
	databaseName string,
	warehouseName string,
	role string,
	account string,
) (*models.DataConnection, error) {
	dataConnection := models.DataConnection{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionType: models.DataConnectionTypeSnowflake,
		Username:       database.NewNullString(username),
		Password:       database.NewNullString(encryptedPassword),
		DatabaseName:   database.NewNullString(databaseName),
		WarehouseName:  database.NewNullString(warehouseName),
		Role:           database.NewNullString(role),
		Account:        database.NewNullString(account),
	}

	result := db.Create(&dataConnection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &dataConnection, nil
}
