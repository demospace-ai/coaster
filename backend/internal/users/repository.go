package users

import (
	"errors"
	"fabra/internal/external_profiles"
	"fabra/internal/models"

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
		Where("users.deactivated_at IS NULL").
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
		Where("users.deactivated_at IS NULL").
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
		Where("users.deactivated_at IS NULL").
		Take(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func create(db *gorm.DB, firstName string, lastName string, email string) (*models.User, error) {
	user := models.User{
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
	}

	result := db.Create(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func CreateUserForExternalInfo(db *gorm.DB, externalUserInfo *ExternalUserInfo) (*models.User, error) {
	user, err := create(db, externalUserInfo.FirstName, externalUserInfo.LastName, externalUserInfo.Email)
	if err != nil {
		return nil, err
	}

	_, err = external_profiles.Create(db, externalUserInfo.ExternalID, user.ID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func SetOrganization(db *gorm.DB, user *models.User, organizationID int64) (*models.User, error) {
	result := db.Model(user).Update("organization_id", organizationID)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

func GetOrCreateForExternalInfo(db *gorm.DB, externalUserInfo *ExternalUserInfo) (*models.User, error) {
	existingUser, err := LoadByExternalID(db, externalUserInfo.ExternalID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	} else if err == nil {
		return existingUser, nil
	}

	user, err := CreateUserForExternalInfo(db, externalUserInfo)
	if err != nil {
		return nil, err
	}

	return user, nil

}

func CreateUserForEmail(db *gorm.DB, email string, firstName string, lastName string) (*models.User, error) {
	user, err := create(db, firstName, lastName, email)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func GetOrCreateForEmail(db *gorm.DB, email string, firstName string, lastName string) (*models.User, error) {
	existingUser, err := LoadByEmail(db, email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	} else if err == nil {
		return existingUser, nil
	}

	user, err := CreateUserForEmail(db, email, firstName, lastName)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func LoadAllByOrganizationID(db *gorm.DB, organizationID int64) ([]models.User, error) {
	var users []models.User
	result := db.Table("users").
		Where("users.organization_id = ?", organizationID).
		Where("users.deactivated_at IS NULL").
		Find(&users)

	if result.Error != nil {
		return nil, result.Error
	}

	return users, nil

}
