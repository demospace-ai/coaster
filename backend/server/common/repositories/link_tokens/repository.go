package link_tokens

import (
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func LoadLinkTokenByHash(db *gorm.DB, hashedToken string) (*models.LinkToken, error) {
	var linkToken models.LinkToken
	result := db.Table("link_tokens").
		Select("link_tokens.*").
		Where("link_tokens.hashed_token = ?", hashedToken).
		Where("link_tokens.deactivated_at IS NULL").
		Take(&linkToken)
	if result.Error != nil {
		return nil, result.Error
	}

	return &linkToken, nil
}
