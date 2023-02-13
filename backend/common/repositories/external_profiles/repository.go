package external_profiles

import (
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, externalID string, userID int64) (*models.ExternalProfile, error) {
	externalProfile := models.ExternalProfile{
		ExternalID: externalID,
		UserID:     userID,
	}
	result := db.Create(&externalProfile)
	if result.Error != nil {
		return nil, result.Error
	}

	return &externalProfile, nil
}
