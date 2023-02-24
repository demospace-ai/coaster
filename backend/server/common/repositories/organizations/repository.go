package organizations

import (
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, organizationName string, emailDomain string) (*models.Organization, error) {
	organization := models.Organization{
		Name:        organizationName,
		EmailDomain: emailDomain,
	}

	result := db.Create(&organization)
	if result.Error != nil {
		return nil, result.Error
	}

	return &organization, nil
}

func LoadOrganizationByID(db *gorm.DB, organizationID int64) (*models.Organization, error) {
	var organization models.Organization
	result := db.Table("organizations").
		Select("organizations.*").
		Where("organizations.id = ?", organizationID).
		Where("organizations.deactivated_at IS NULL").
		Take(&organization)
	if result.Error != nil {
		return nil, result.Error
	}

	return &organization, nil
}

func LoadOrganizationsByEmailDomain(db *gorm.DB, emailDomain string) ([]models.Organization, error) {
	var organizations []models.Organization
	result := db.Table("organizations").
		Where("organizations.email_domain = ?", emailDomain).
		Where("organizations.deactivated_at IS NULL").
		Find(&organizations)

	if result.Error != nil {
		return nil, result.Error
	}

	return organizations, nil
}

func LoadOrganizationByApiKey(db *gorm.DB, hashedKey string) (*models.Organization, error) {
	var organization models.Organization
	result := db.Table("organizations").
		Select("organizations.*").
		Joins("JOIN api_keys ON api_keys.organization_id = organizations.id").
		Where("api_keys.hashed_key = ?", hashedKey).
		Where("organizations.deactivated_at IS NULL").
		Where("api_keys.deactivated_at IS NULL").
		Take(&organization)
	if result.Error != nil {
		return nil, result.Error
	}

	return &organization, nil
}
