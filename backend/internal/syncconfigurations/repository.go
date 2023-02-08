package syncconfigurations

import (
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateSyncConfiguration(
	db *gorm.DB,
	organizationID int64,
	endCustomerID int64,
	displayName string,
	destinationID int64,
	sourceID int64,
	modelID int64,
) (*models.SyncConfiguration, error) {

	syncConfiguration := models.SyncConfiguration{
		OrganizationID: organizationID,
		EndCustomerID:  endCustomerID,
		DisplayName:    displayName,
		DestinationID:  destinationID,
		SourceID:       sourceID,
		ModelID:        modelID,
	}

	result := db.Create(&syncConfiguration)
	if result.Error != nil {
		return nil, result.Error
	}

	return &syncConfiguration, nil
}

func LoadSyncConfigurationByID(db *gorm.DB, organizationID int64, eventSetID int64) (*models.SyncConfiguration, error) {
	var eventSet models.SyncConfiguration
	result := db.Table("sync_configurations").
		Select("sync_configurations.*").
		Where("sync_configurations.id = ?", eventSetID).
		Where("sync_configurations.organization_id = ?", organizationID).
		Where("sync_configurations.deactivated_at IS NULL").
		Take(&eventSet)

	if result.Error != nil {
		return nil, result.Error
	}

	return &eventSet, nil
}

func LoadAllSyncConfigurations(
	db *gorm.DB,
	organizationID int64,
) ([]models.SyncConfiguration, error) {
	var syncConfiguration []models.SyncConfiguration
	result := db.Table("sync_configurations").
		Select("sync_configurations.*").
		Where("sync_configurations.organization_id = ?", organizationID).
		Where("sync_configurations.deactivated_at IS NULL").
		Order("sync_configurations.created_at ASC").
		Find(&syncConfiguration)

	if result.Error != nil {
		return nil, result.Error
	}

	return syncConfiguration, nil
}
