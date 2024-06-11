package external_profiles

import (
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/models"
	"go.coaster.io/server/common/oauth"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, externalID string, oauthProvider oauth.OauthProvider, userID int64) (*models.ExternalProfile, error) {
	externalProfile := models.ExternalProfile{
		ExternalID:    externalID,
		OauthProvider: oauthProvider,
		UserID:        userID,
	}
	result := db.Create(&externalProfile)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(external_profiles.Create)")
	}

	return &externalProfile, nil
}
