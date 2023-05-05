package webhooks

import (
	"time"

	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func CreateEndCustomerApiKey(db *gorm.DB, organizationID int64, endCustomerID string, encryptedKey string) error {
	endCustomerApiKey := models.EndCustomerApiKey{
		OrganizationID: organizationID,
		EndCustomerID:  endCustomerID,
		EncryptedKey:   encryptedKey,
	}

	result := db.Create(&endCustomerApiKey)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

func LoadEndCustomerApiKey(db *gorm.DB, organizationID int64, endCustomerID string) (*string, error) {
	var endCustomerApiKey models.EndCustomerApiKey
	result := db.Table("end_customer_api_keys").
		Select("end_customer_api_keys.*").
		Where("end_customer_api_keys.organization_id = ?", organizationID).
		Where("end_customer_api_keys.end_customer_id = ?", endCustomerID).
		Where("end_customer_api_keys.deactivated_at IS NULL").
		Take(&endCustomerApiKey)

	if result.Error != nil {
		return nil, result.Error
	}

	return &endCustomerApiKey.EncryptedKey, nil
}

func DeactivateExistingEndCustomerApiKey(db *gorm.DB, organizationID int64, endCustomerID string) error {
	result := db.Table("end_customer_api_keys").
		Where("end_customer_api_keys.organization_id = ?", organizationID).
		Where("end_customer_api_keys.end_customer_id = ?", endCustomerID).
		Update("deactivated_at", time.Now())

	if result.Error != nil {
		return result.Error
	}

	return nil
}
