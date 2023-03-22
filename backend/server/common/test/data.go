package test

import (
	"time"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/sessions"

	"gorm.io/gorm"
)

func CreateOrganization(db *gorm.DB) *models.Organization {
	organization := models.Organization{
		Name:        "Fabra",
		EmailDomain: "go.fabra.io",
	}

	db.Create(&organization)

	return &organization
}

func CreateUser(db *gorm.DB, organizationID int64) *models.User {
	user := models.User{
		FirstName:         "Test",
		LastName:          "User",
		Email:             "test@go.fabra.io",
		ProfilePictureURL: "",
		OrganizationID:    database.NewNullInt64(organizationID),
	}

	db.Create(&user)

	return &user
}

func CreateConnection(db *gorm.DB, organizationID int64) *models.Connection {
	connection := models.Connection{
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

func CreateApiKey(db *gorm.DB, organizationID int64) string {
	rawKey := "apikey"
	cryptoService := MockCryptoService{}
	encrypted, _ := cryptoService.EncryptApiKey(rawKey)
	hashedKey := crypto.HashString(rawKey)
	apiKey := models.ApiKey{
		EncryptedKey:   *encrypted,
		OrganizationID: organizationID,
		HashedKey:      hashedKey,
	}

	db.Create(&apiKey)

	return rawKey
}

func CreateActiveLinkToken(db *gorm.DB, organizationID int64, endCustomerId int64) string {
	rawToken := "linkToken"
	hashedToken := crypto.HashString(rawToken)
	linkToken := models.LinkToken{
		EndCustomerID:  endCustomerId,
		OrganizationID: organizationID,
		HashedToken:    hashedToken,
		Expiration:     time.Now().Add(time.Duration(1) * time.Hour),
	}

	db.Create(&linkToken)

	return rawToken
}

func CreateExpiredLinkToken(db *gorm.DB, organizationID int64, endCustomerId int64) string {
	rawToken := "linkToken"
	hashedToken := crypto.HashString(rawToken)
	linkToken := models.LinkToken{
		EndCustomerID:  endCustomerId,
		OrganizationID: organizationID,
		HashedToken:    hashedToken,
		Expiration:     time.Now().Add(-(time.Duration(1) * time.Hour)),
	}

	db.Create(&linkToken)

	return rawToken
}
