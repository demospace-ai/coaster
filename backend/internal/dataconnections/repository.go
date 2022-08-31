package dataconnections

import (
	"fabra/internal/crypto"
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

const CRYPTO_KEY_NAME = "data-connection-key"

func CreateBigQueryDataConnection(db *gorm.DB, organizationID int64, displayName string, credentials string) (*models.DataConnection, error) {
	encryptedCredentials, err := crypto.Encrypt(CRYPTO_KEY_NAME, credentials)
	if err != nil {
		return nil, err
	}

	dataConnection := models.DataConnection{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionType: models.DataConnectionTypeBigQuery,
		Credentials:    database.NewNullString(*encryptedCredentials),
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
	password string,
	databaseName string,
	warehouseName string,
	role string,
	account string,
) (*models.DataConnection, error) {
	encryptedPassword, err := crypto.Encrypt(CRYPTO_KEY_NAME, password)
	if err != nil {
		return nil, err
	}

	dataConnection := models.DataConnection{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionType: models.DataConnectionTypeSnowflake,
		Username:       database.NewNullString(username),
		Password:       database.NewNullString(*encryptedPassword),
		DatabaseName:   database.NewNullString(databaseName),
		WarehouseName:  database.NewNullString(warehouseName),
		Role:           database.NewNullString(role),
		Account:        database.NewNullString(account),
	}

	result := db.Create(&dataConnection)
	if result.Error != nil {
		return nil, result.Error
	}

	return &dataConnection, err
}
