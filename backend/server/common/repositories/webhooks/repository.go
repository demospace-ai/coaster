package webhooks

import (
	"time"

	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func CreateEndCustomerApiKey(db *gorm.DB, organizationID int64, endCustomerID int64, encryptedKey string) error {
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

func DeactivateExistingEndCustomerApiKey(db *gorm.DB, organizationID int64, endCustomerID int64) error {
	result := db.Table("end_customer_api_keys").
		Where("end_customer_api_keys.organization_id = ?", organizationID).
		Where("end_customer_api_keys.end_customer_id = ?", endCustomerID).
		Update("deactivated_at", time.Now())

	if result.Error != nil {
		return result.Error
	}

	return nil
}
