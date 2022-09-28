package test

import (
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateTestOrganization(db *gorm.DB) *models.Organization {
	organization := models.Organization{
		Name:        "Fabra",
		EmailDomain: "fabra.io",
	}

	db.Create(&organization)

	return &organization
}

func CreateTestUser(db *gorm.DB, organizationID int64) *models.User {
	user := models.User{
		FirstName:         "Test",
		LastName:          "User",
		Email:             "test@fabra.io",
		ProfilePictureURL: "",
		OrganizationID:    database.NewNullInt64(organizationID),
	}

	db.Create(&user)

	return &user
}

func CreateTestDataConnection(db *gorm.DB, organizationID int64) *models.DataConnection {
	dataConnection := models.DataConnection{
		DisplayName:    "Test",
		OrganizationID: organizationID,
		ConnectionType: models.DataConnectionTypeBigQuery,
		Credentials:    database.NewNullString("test"),
	}

	db.Create(&dataConnection)

	return &dataConnection
}
