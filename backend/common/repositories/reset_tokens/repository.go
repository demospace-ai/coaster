package reset_tokens

import (
	"crypto/rand"
	"fmt"
	"time"

	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/models"
	"gorm.io/gorm"
)

const RESET_TOKEN_BITS = 256
const RESET_TOKEN_EXPIRATION = time.Minute * 30
const EXTENDED_RESET_TOKEN_EXPIRATION = time.Hour * 24 * 7 // 7 days

func GetActiveResetToken(db *gorm.DB, user *models.User) (*models.ResetToken, error) {
	var resetToken *models.ResetToken
	result := db.Table("reset_tokens").
		Select("reset_tokens.*").
		Where("reset_tokens.user_id = ?", user.ID).
		Where("reset_tokens.expiration >= ?", time.Now()).
		Where("reset_tokens.deactivated_at IS NULL").
		Take(&resetToken)

	if result.Error != nil {
		if errors.IsRecordNotFound(result.Error) {
			return create(db, user, time.Now().Add(RESET_TOKEN_EXPIRATION))
		} else {
			return nil, errors.Wrap(result.Error, "(reset_tokens.GetActiveResetToken)")
		}
	}

	return resetToken, nil
}

func GetExtendedResetToken(db *gorm.DB, user *models.User) (*models.ResetToken, error) {
	var resetToken *models.ResetToken
	result := db.Table("reset_tokens").
		Select("reset_tokens.*").
		Where("reset_tokens.user_id = ?", user.ID).
		Where("reset_tokens.expiration >= ?", time.Now()).
		Where("reset_tokens.deactivated_at IS NULL").
		Take(&resetToken)

	if result.Error != nil {
		if errors.IsRecordNotFound(result.Error) {
			return create(db, user, time.Now().Add(EXTENDED_RESET_TOKEN_EXPIRATION))
		} else {
			return nil, errors.Wrap(result.Error, "(reset_tokens.GetActiveResetToken)")
		}
	}

	return resetToken, nil
}

func LoadValidByToken(db *gorm.DB, token string) (*models.ResetToken, error) {
	var resetToken models.ResetToken
	result := db.Table("reset_tokens").
		Select("reset_tokens.*").
		Where("reset_tokens.token = ?", token).
		Where("reset_tokens.expiration >= ?", time.Now()).
		Where("reset_tokens.deactivated_at IS NULL").
		Take(&resetToken)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(sessions.LoadValidByToken)")
	}

	return &resetToken, nil
}

func DeactivateToken(db *gorm.DB, token *models.ResetToken) error {
	currentTime := time.Now()
	result := db.Model(token).Update("deactivated_at", currentTime)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(reset_tokens.DeactivateToken)")
	}

	return nil
}

func create(db *gorm.DB, user *models.User, expiration time.Time) (*models.ResetToken, error) {
	token, err := generateResetToken()
	if err != nil {
		return nil, errors.Wrap(err, "(reset_tokens.create)")
	}

	resetToken := models.ResetToken{
		Token:      *token,
		UserID:     user.ID,
		Expiration: expiration,
	}

	result := db.Create(&resetToken)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(reset_tokens.create)")
	}

	return &resetToken, nil
}

func generateResetToken() (*string, error) {
	b := make([]byte, RESET_TOKEN_BITS/8)
	_, err := rand.Read(b)
	if err != nil {
		return nil, errors.Wrap(err, "(reset_tokens.generateResetToken)")
	}

	token := fmt.Sprintf("%x", b)
	return &token, nil
}
