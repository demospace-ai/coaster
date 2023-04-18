package test

import (
	"log"
	"time"

	"go.fabra.io/server/common/crypto"
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/input"
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
		Name:              "Test Test",
		Email:             "test@go.fabra.io",
		ProfilePictureURL: "",
		OrganizationID:    database.NewNullInt64(organizationID),
	}

	db.Create(&user)

	return &user
}

func CreateSync(db *gorm.DB, organizationID int64, endCustomerID int64, sourceID int64, objectID int64, syncMode models.SyncMode) *models.Sync {
	sync := models.Sync{
		OrganizationID: organizationID,
		EndCustomerID:  endCustomerID,
		SourceID:       sourceID,
		ObjectID:       objectID,
		Namespace:      database.NewNullString("namespace"),
		TableName:      database.NewNullString("table"),
		SyncMode:       syncMode,
	}

	db.Create(&sync)

	return &sync
}

func CreateSource(db *gorm.DB, organizationID int64, endCustomerID int64) (*models.Source, *models.Connection) {
	connection := CreateConnection(db, organizationID)
	source := models.Source{
		OrganizationID: organizationID,
		EndCustomerID:  endCustomerID,
		ConnectionID:   connection.ID,
	}

	result := db.Create(&source)
	if result.Error != nil {
		log.Println(result.Error)
	}

	return &source, connection
}

func CreateDestination(db *gorm.DB, organizationID int64, endCustomerID int64) (*models.Destination, *models.Connection) {
	connection := CreateConnection(db, organizationID)
	destination := models.Destination{
		OrganizationID: organizationID,
		ConnectionID:   connection.ID,
		StagingBucket:  database.NewNullString("staging"),
	}

	result := db.Create(&destination)
	if result.Error != nil {
		log.Println(result.Error)
	}

	return &destination, connection
}

func CreateObject(db *gorm.DB, organizationID int64, destinationID int64, syncMode models.SyncMode) *models.Object {
	object := models.Object{
		OrganizationID:     organizationID,
		DisplayName:        "object",
		DestinationID:      destinationID,
		Namespace:          database.NewNullString("namespace"),
		TableName:          database.NewNullString("table"),
		EndCustomerIdField: "end_customer_id",
		SyncMode:           syncMode,
	}

	result := db.Create(&object)
	if result.Error != nil {
		log.Println(result.Error)
	}

	return &object
}

func CreateObjectFields(db *gorm.DB, objectID int64, fields []input.ObjectField) []models.ObjectField {
	var fieldModels []models.ObjectField
	for _, field := range fields {
		fieldModel := models.ObjectField{
			ObjectID: objectID,
			Name:     field.Name,
			Type:     field.Type,
			Optional: field.Optional,
			Omit:     field.Omit,
		}

		db.Create(&fieldModel)
		fieldModels = append(fieldModels, fieldModel)
	}

	return fieldModels
}

func CreateFieldMappings(db *gorm.DB, syncID int64, fieldMappings []input.FieldMapping) []models.FieldMapping {
	var fieldMappingModels []models.FieldMapping
	for _, mapping := range fieldMappings {
		fieldMappingModel := models.FieldMapping{
			SyncID:             syncID,
			SourceFieldName:    mapping.SourceFieldName,
			SourceFieldType:    mapping.SourceFieldType,
			DestinationFieldId: mapping.DestinationFieldId,
		}

		db.Create(&fieldMappingModel)
		fieldMappingModels = append(fieldMappingModels, fieldMappingModel)
	}

	return fieldMappingModels
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
