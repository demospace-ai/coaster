package emails

import (
	"fabra/internal/models"

	"gorm.io/gorm"
)

func LoadByUserID(db *gorm.DB, userID int64) (*models.Email, error) {
	var email models.Email
	result := db.Take(&email, "user_id = ?", userID)
	if result.Error != nil {
		return nil, result.Error
	}

	return &email, nil
}

func Create(db *gorm.DB, emailAddress string, userID int64) (*models.Email, error) {
	email := models.Email{
		Email:  emailAddress,
		UserID: userID,
	}
	result := db.Create(&email)
	if result.Error != nil {
		return nil, result.Error
	}

	return &email, nil
}
