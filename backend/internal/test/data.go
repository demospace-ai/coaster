package test

import (
	"fabra/internal/database"
	"fabra/internal/models"
	"fabra/internal/sessions"
	"time"

	"gorm.io/gorm"
)

func CreateOrganization(db *gorm.DB) *models.Organization {
	organization := models.Organization{
		Name:        "Fabra",
		EmailDomain: "fabra.io",
	}

	db.Create(&organization)

	return &organization
}

func CreateUser(db *gorm.DB, organizationID int64) *models.User {
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

func CreateConnection(db *gorm.DB, organizationID int64) *models.Connection {
	connection := models.Connection{
		DisplayName:    "Test Data Connection",
		OrganizationID: organizationID,
		ConnectionType: models.ConnectionTypeBigQuery,
		Credentials:    database.NewNullString("testCredentials"),
	}

	db.Create(&connection)

	return &connection
}

func CreateActiveSession(db *gorm.DB, userID int64) string {
	rawToken := "active"
	token := sessions.HashToken(rawToken)
	session := models.Session{
		Token:      token,
		UserID:     userID,
		Expiration: time.Now().Add(time.Duration(1) * time.Hour),
	}

	db.Create(&session)

	return rawToken
}

func CreateExpiredSession(db *gorm.DB, userID int64) string {
	rawToken := "expired"
	token := sessions.HashToken(rawToken)
	session := models.Session{
		Token:      token,
		UserID:     userID,
		Expiration: time.Now().Add(-(time.Duration(1) * time.Hour)),
	}

	db.Create(&session)

	return rawToken
}
