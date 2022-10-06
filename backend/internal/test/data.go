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

func CreateDataConnection(db *gorm.DB, organizationID int64) *models.DataConnection {
	dataConnection := models.DataConnection{
		DisplayName:    "Test Data Connection",
		OrganizationID: organizationID,
		ConnectionType: models.DataConnectionTypeBigQuery,
		Credentials:    database.NewNullString("testCredentials"),
	}

	db.Create(&dataConnection)

	return &dataConnection
}

func CreateFunnelAnalysis(db *gorm.DB, userID int64, organizationID int64, connectionID int64, eventSetID int64) *models.Analysis {
	analysis := models.Analysis{
		UserID:         userID,
		OrganizationID: organizationID,
		ConnectionID:   database.NewNullInt64(connectionID),
		EventSetID:     database.NewNullInt64(eventSetID),
		AnalysisType:   models.AnalysisTypeFunnel,
	}

	db.Create(&analysis)

	return &analysis
}

func CreateCustomQueryAnalysis(db *gorm.DB, userID int64, organizationID int64, connectionID int64) *models.Analysis {
	analysis := models.Analysis{
		UserID:         userID,
		OrganizationID: organizationID,
		ConnectionID:   database.NewNullInt64(connectionID),
		AnalysisType:   models.AnalysisTypeCustomQuery,
		Query:          database.NewNullString("select * from table"),
	}

	db.Create(&analysis)

	return &analysis
}

func CreateEventSet(db *gorm.DB, organizationID int64, connectionID int64) *models.EventSet {
	eventSet := models.EventSet{
		DisplayName:          "Test Event Set",
		OrganizationID:       organizationID,
		ConnectionID:         connectionID,
		DatasetName:          database.NewNullString("testDataset"),
		TableName:            database.NewNullString("testTable"),
		EventTypeColumn:      "event_type",
		TimestampColumn:      "timestamp",
		UserIdentifierColumn: "user_id",
	}

	db.Create(&eventSet)

	return &eventSet
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
