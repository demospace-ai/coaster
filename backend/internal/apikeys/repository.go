package apikeys

import (
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateApiKey(db *gorm.DB, organizationID int64, encryptedApiKey string) (*models.ApiKey, error) {
	apiKey := models.ApiKey{
		OrganizationID: organizationID,
		ApiKey:         encryptedApiKey,
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
