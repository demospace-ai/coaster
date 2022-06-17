package verifications

import (
	"fabra/internal/models"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

const codeLength = 6
const codeCharacters = "0123456789"
const codeExpiration = 15 * time.Minute

func Create(db *gorm.DB, userID int64) (*string, error) {
	code := generateCode()

	expiration := time.Now().Add(codeExpiration)

	verification := models.Verification{
		Code:       code,
		UserID:     userID,
		Expiration: expiration,
	}

	result := db.Create(&verification)
	if result.Error != nil {
		return nil, result.Error
	}

	return &code, nil
}

func generateCode() string {
	codeBytes := make([]byte, codeLength)
	for i := range codeBytes {
		codeBytes[i] = codeCharacters[rand.Intn(len(codeCharacters))]
	}
	return string(codeBytes)
}

func VerifyCode(db *gorm.DB, code string, userID int64) (*models.Verification, error) {
	var verification models.Verification
	result := db.Take(&verification, "code = ? AND user_id = ? AND expiration >= ? AND used = ? AND deactivated_at IS NULL", code, userID, time.Now(), false)
	if result.Error != nil {
		return nil, result.Error
	}

	result = db.Model(&verification).Update("used", true)
	if result.Error != nil {
		return nil, result.Error
	}

	return &verification, nil
}
