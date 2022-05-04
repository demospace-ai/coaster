package user_identities

import (
	"fabra/internal/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, firstName string, lastName string, userID int64) (*models.UserIdentity, error) {
	userIdentity := models.UserIdentity{
		FirstName: firstName,
		LastName:  lastName,
		UserID:    userID,
	}
	result := db.Create(&userIdentity)
	if result.Error != nil {
		return nil, result.Error
	}

	return &userIdentity, nil
}

func LoadByUserID(db *gorm.DB, userID int64) (*models.UserIdentity, error) {
	var user models.UserIdentity
	result := db.Table("user_identities").
		Select("user_identities.*").
		Where("user_identities.user_id = ?", userID).
		Take(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}
