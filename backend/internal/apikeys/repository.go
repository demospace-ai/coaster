package apikeys

import (
	"crypto/sha256"
	"encoding/base64"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateApiKey(db *gorm.DB, organizationID int64, encryptedApiKey string, hashedKey string) (*models.ApiKey, error) {
	apiKey := models.ApiKey{
		OrganizationID: organizationID,
		ApiKey:         encryptedApiKey,
		HashedKey:      hashedKey,
	}

	result := db.Create(&apiKey)
	if result.Error != nil {
		return nil, result.Error
	}

	return &apiKey, nil
}

func LoadApiKeyForOrganization(db *gorm.DB, organizationID int64) (*models.ApiKey, error) {
	var apiKey models.ApiKey
	result := db.Table("api_keys").
		Select("api_keys.*").
		Where("api_keys.organization_id = ?", organizationID).
		Where("api_keys.deactivated_at IS NULL").
		Take(&apiKey)

	if result.Error != nil {
		return nil, result.Error
	}

	return &apiKey, nil
}

func HashKey(key string) string {
	h := sha256.Sum256([]byte(key))
	return base64.StdEncoding.EncodeToString(h[:])
}
