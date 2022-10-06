package organizations

import (
	"fabra/internal/database"
	"fabra/internal/models"

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

func SetOrganizationDefaultDataConnection(db *gorm.DB, organization *models.Organization, dataConnectionID int64) (*models.Organization, error) {
	organization.DefaultDataConnectionID = database.NewNullInt64(dataConnectionID)
	result := db.Save(organization)
	if result.Error != nil {
		return nil, result.Error
	}

	return organization, nil
}

func SetOrganizationDefaultEventSet(db *gorm.DB, organization *models.Organization, eventSetID int64) (*models.Organization, error) {
	organization.DefaultEventSetID = database.NewNullInt64(eventSetID)
	result := db.Save(organization)
	if result.Error != nil {
		return nil, result.Error
	}

	return organization, nil
}
