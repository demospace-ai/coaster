package syncconfigurations

import (
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateSyncConfiguration(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	connectionID int64,
	datasetName *string,
	tableName *string,
	customJoin *string,
) (*models.SyncConfiguration, error) {

	syncConfiguration := models.SyncConfiguration{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionID:   connectionID,
	}

	if tableName != nil && datasetName != nil {
		syncConfiguration.DatasetName = database.NewNullString(*datasetName)
		syncConfiguration.TableName = database.NewNullString(*tableName)
	} else if customJoin != nil {
		syncConfiguration.CustomJoin = database.NewNullString(*customJoin)
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
	var eventSets []models.SyncConfiguration
	result := db.Table("sync_configuration").
		Select("sync_configurations.*").
		Where("sync_configurations.organization_id = ?", organizationID).
		Where("sync_configurations.deactivated_at IS NULL").
		Order("sync_configurations.created_at ASC").
		Find(&eventSets)

	if result.Error != nil {
		return nil, result.Error
	}

	return eventSets, nil
}
