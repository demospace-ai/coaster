package users

import (
	"errors"
	"fabra/internal/emails"
	"fabra/internal/external_profiles"
	"fabra/internal/models"
	"fabra/internal/user_identities"

	"gorm.io/gorm"
)

// Maximum of 62^8 guarantees number will be at most 8 digits in base
const MAX_RANDOM = 218340105584896

type ExternalUserInfo struct {
	ExternalID string
	Email      string
	FirstName  string
	LastName   string
}

func LoadByExternalID(db *gorm.DB, externalID string) (*models.User, error) {
	var user models.User
	result := db.Table("users").
		Joins("JOIN external_profiles ON external_profiles.user_id = users.id").
		Where("external_profiles.external_id = ?", externalID).
		Take(&user)

	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func LoadByEmail(db *gorm.DB, email string) (*models.User, error) {
	var user models.User
	result := db.Table("users").
		Joins("JOIN emails ON emails.user_id = users.id").
		Where("emails.email = ?", email).
		Take(&user)

	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func LoadUserByID(db *gorm.DB, userID int64) (*models.User, error) {
	var user models.User
	result := db.Table("users").
		Select("users.*").
		Where("users.id = ?", userID).
		Take(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func create(db *gorm.DB) (*models.User, error) {
	user := models.User{}

	result := db.Create(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func CreateUserForExternalInfo(db *gorm.DB, externalUserInfo *ExternalUserInfo) (*models.User, *models.UserIdentity, error) {
	user, err := create(db)
	if err != nil {
		return nil, nil, err
	}

	_, err = external_profiles.Create(db, externalUserInfo.ExternalID, user.ID)
	if err != nil {
		return nil, nil, err
	}

	_, err = emails.Create(db, externalUserInfo.Email, user.ID)
	if err != nil {
		return nil, nil, err
	}

	userIdentity, err := user_identities.Create(db, externalUserInfo.FirstName, externalUserInfo.LastName, user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, userIdentity, nil
}

func GetOrCreateForExternalInfo(db *gorm.DB, externalUserInfo *ExternalUserInfo) (*models.User, *models.UserIdentity, error) {
	existingUser, err := LoadByExternalID(db, externalUserInfo.ExternalID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, err
	} else if err == nil {
		userIdentity, err := user_identities.LoadByUserID(db, existingUser.ID)
		if err != nil {
			return nil, nil, err
		}

		return existingUser, userIdentity, nil
	}

	user, userIdentity, err := CreateUserForExternalInfo(db, externalUserInfo)
	if err != nil {
		return nil, nil, err
	}

	return user, userIdentity, nil
}

func CreateUserForEmail(db *gorm.DB, email string) (*models.User, error) {
	user, err := create(db)
	if err != nil {
		return nil, err
	}

	_, err = emails.Create(db, email, user.ID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func GetOrCreateForEmail(db *gorm.DB, email string) (*models.User, error) {
	existingUser, err := LoadByEmail(db, email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	} else if err == nil {
		return existingUser, nil
	}

	user, err := CreateUserForEmail(db, email)
	if err != nil {
		return nil, err
	}

	return user, nil
}
