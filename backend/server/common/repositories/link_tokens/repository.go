package link_tokens

import (
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

const LINK_TOKEN_EXPIRATION = time.Duration(1) * time.Hour

func CreateLinkToken(db *gorm.DB, organizationID int64, endCustomerID string, hashedToken string) (*models.LinkToken, error) {
	expiration := time.Now().Add(LINK_TOKEN_EXPIRATION)

	linkToken := models.LinkToken{
		OrganizationID: organizationID,
		EndCustomerID:  endCustomerID,
		HashedToken:    hashedToken,
		Expiration:     expiration,
	}

	result := db.Create(&linkToken)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(link_tokens.CreateLinkToken)")
	}

	return &linkToken, nil
}

func LoadLinkTokenByHash(db *gorm.DB, hashedToken string) (*models.LinkToken, error) {
	var linkToken models.LinkToken
	result := db.Table("link_tokens").
		Select("link_tokens.*").
		Where("link_tokens.hashed_token = ?", hashedToken).
		Where("link_tokens.deactivated_at IS NULL").
		Where("link_tokens.expiration >= ?", time.Now()).
		Take(&linkToken)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(link_tokens.LoadLinkTokenByHash)")
	}

	return &linkToken, nil
}
