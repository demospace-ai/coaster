package users

import (
	"strings"

	"go.coaster.io/server/common/emails"
	"go.coaster.io/server/common/errors"
	"go.coaster.io/server/common/events"
	"go.coaster.io/server/common/input"
	"go.coaster.io/server/common/models"
	"go.coaster.io/server/common/oauth"
	"go.coaster.io/server/common/repositories/external_profiles"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Maximum of 62^8 guarantees number will be at most 8 digits in base
const MAX_RANDOM = 218340105584896

func LoadByExternalID(db *gorm.DB, externalID string) (*models.User, error) {
	var user models.User
	result := db.Table("users").
		Joins("JOIN external_profiles ON external_profiles.user_id = users.id").
		Where("external_profiles.external_id = ?", externalID).
		Where("users.deactivated_at IS NULL").
		Where("external_profiles.deactivated_at IS NULL").
		Take(&user)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.LoadByExternalID)")
	}

	return &user, nil
}

func LoadByEmail(db *gorm.DB, email string) (*models.User, error) {
	var user models.User
	result := db.Table("users").
		Where("users.email = ?", email).
		Where("users.deactivated_at IS NULL").
		Take(&user)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.LoadByEmail)")
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
		return nil, errors.Wrap(result.Error, "(users.LoadUserByID)")
	}

	return &user, nil
}

func UpdateUser(db *gorm.DB, user *models.User, updates input.UserUpdates) (*models.User, error) {
	if updates.FirstName != nil {
		user.FirstName = *updates.FirstName
	}

	if updates.LastName != nil {
		user.LastName = *updates.LastName
	}

	if updates.About != nil {
		user.About = updates.About
	}

	if updates.Password != nil {
		passwordHash, err := bcrypt.GenerateFromPassword([]byte(*updates.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.Wrap(err, "(users.CreateUserFromEmail) generating password hash")
		}
		hashedPassword := string(passwordHash)
		user.HashedPassword = &hashedPassword
	}

	result := db.Save(user)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.UpdateUser)")
	}

	return user, nil
}

func UpdateProfilePicture(db *gorm.DB, user *models.User, profilePictureUrl string, width int, height int) (*models.User, error) {
	user.ProfilePictureURL = &profilePictureUrl
	user.ProfilePictureWidth = &width
	user.ProfilePictureHeight = &height

	result := db.Save(user)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.UpdateProfilePicture)")
	}

	return user, nil
}

func CreateUserFromEmail(db *gorm.DB, email string, firstName string, lastName string, password string) (*models.User, error) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.Wrap(err, "(users.CreateUserFromEmail) generating password hash")
	}
	passwordHashStr := string(passwordHash)

	user := models.User{
		Email:               email,
		FirstName:           firstName,
		LastName:            lastName,
		HashedPassword:      &passwordHashStr,
		LoginMethod:         models.LoginMethodEmail,
		IsHost:              false,
		EmailVerified:       false,
		StripeAccountStatus: models.StripeAccountStatusIncomplete,
		Currency:            "USD", // TODO: allow other currencies
		CommissionPercent:   15,    // TODO: allow other take rates
	}

	result := db.Create(&user)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.CreateUserFromEmail) creating user")
	}

	emails.CreateContact(user.Email, user.FirstName, user.LastName, user.ID)
	events.TrackSignup(user.ID, user.FirstName, user.LastName, user.Email)

	return &user, nil
}

func CreateUserForExternalInfo(db *gorm.DB, externalUserInfo *oauth.ExternalUserInfo) (*models.User, error) {
	user := models.User{
		FirstName:           externalUserInfo.FirstName,
		LastName:            externalUserInfo.LastName,
		Email:               strings.ToLower(externalUserInfo.Email),
		ProfilePictureURL:   &externalUserInfo.ProfilePictureURL,
		LoginMethod:         models.LoginMethodGoogle,
		IsHost:              false,
		EmailVerified:       true,
		StripeAccountStatus: models.StripeAccountStatusIncomplete,
		Currency:            "USD", // TODO: allow other currencies
		CommissionPercent:   15,    // TODO: allow other take rates
	}

	result := db.Create(&user)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.create)")
	}

	_, err := external_profiles.Create(db, externalUserInfo.ExternalID, externalUserInfo.OauthProvider, user.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(users.CreateUserForExternalInfo)")
	}

	emails.CreateContact(user.Email, user.FirstName, user.LastName, user.ID)
	events.TrackSignup(user.ID, user.FirstName, user.LastName, user.Email)

	return &user, nil
}

func GetOrCreateForExternalInfo(db *gorm.DB, externalUserInfo *oauth.ExternalUserInfo) (*models.User, error) {
	existingUser, err := LoadByExternalID(db, externalUserInfo.ExternalID)
	if err != nil && !errors.IsRecordNotFound(err) {
		return nil, errors.Wrap(err, "(users.GetOrCreateForExternalInfo)")
	} else if err == nil {
		return existingUser, nil
	}

	user, err := CreateUserForExternalInfo(db, externalUserInfo)
	if err != nil {
		return nil, errors.Wrap(err, "(users.GetOrCreateForExternalInfo)")
	}

	return user, nil
}

func SetIsHost(db *gorm.DB, userID int64, isHost bool) error {
	result := db.Table("users").Where("id = ?", userID).Update("is_host", isHost)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(users.SetIsHost)")
	}

	return nil
}

func JoinWaitlist(db *gorm.DB, email string) error {
	waitlist := models.Waitlist{
		Email: email,
		Phone: "", // Not taking phone numbers anymore
	}
	result := db.Clauses(clause.OnConflict{DoNothing: true, Columns: []clause.Column{{Name: "phone"}}}).Create(&waitlist)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(users.JoinWaitlist)")
	}

	return nil
}

func UpdateStripeStatus(db *gorm.DB, user *models.User, status models.StripeAccountStatus) (*models.User, error) {
	user.StripeAccountStatus = status
	result := db.Save(&user)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.UpdateStripeStatus)")
	}

	return user, nil
}

func UpdateStripeAccountID(db *gorm.DB, user *models.User, stripeID string) (*models.User, error) {
	user.StripeAccountID = &stripeID
	result := db.Save(&user)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(users.UpdateStripeAccountID)")
	}

	return user, nil
}
