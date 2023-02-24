package syncs

import (
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func CreateSync(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	endCustomerID int64,
	destinationID int64,
	sourceID int64,
	objectID int64,
	namespace *string,
	tableName *string,
	customJoin *string,
	cursorField *string,
	primaryKey *string,
	syncMode models.SyncMode,
	frequency int64,
) (*models.Sync, error) {

	sync := models.Sync{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		EndCustomerId:  endCustomerID,
		DestinationID:  destinationID,
		SourceID:       sourceID,
		ObjectID:       objectID,
		SyncMode:       syncMode,
		Frequency:      frequency,
	}

	if tableName != nil && namespace != nil {
		sync.Namespace = database.NewNullString(*namespace)
		sync.TableName = database.NewNullString(*tableName)
	}

	if customJoin != nil {
		sync.CustomJoin = database.NewNullString(*customJoin)
	}

	if cursorField != nil {
		sync.CursorField = database.NewNullString(*cursorField)
	}

	if primaryKey != nil {
		sync.PrimaryKey = database.NewNullString(*primaryKey)
	}

	result := db.Create(&sync)
	if result.Error != nil {
		return nil, result.Error
	}

	return &sync, nil
}

func CreateFieldMappings(
	db *gorm.DB,
	organizationID int64,
	syncID int64,
	syncFieldMappings []input.SyncFieldMapping,
) ([]models.SyncFieldMapping, error) {
	var createdSyncFieldMappings []models.SyncFieldMapping
	for _, syncFieldMapping := range syncFieldMappings {
		syncFieldMappingModel := models.SyncFieldMapping{
			SourceFieldName:      syncFieldMapping.SourceFieldName,
			DestinationFieldName: syncFieldMapping.DestinationFieldName,
		}

		result := db.Create(&syncFieldMappingModel)
		if result.Error != nil {
			return nil, result.Error
		}
		createdSyncFieldMappings = append(createdSyncFieldMappings, syncFieldMappingModel)
	}

	return createdSyncFieldMappings, nil
}

func LoadSyncByID(db *gorm.DB, organizationID int64, syncID int64) (*models.Sync, error) {
	var eventSet models.Sync
	result := db.Table("syncs").
		Select("syncs.*").
		Where("syncs.id = ?", syncID).
		Where("syncs.organization_id = ?", organizationID).
		Where("syncs.deactivated_at IS NULL").
		Take(&eventSet)

	if result.Error != nil {
		return nil, result.Error
	}

	return &eventSet, nil
}

func LoadAllSyncs(
	db *gorm.DB,
	organizationID int64,
) ([]models.Sync, error) {
	var sync []models.Sync
	result := db.Table("syncs").
		Select("syncs.*").
		Where("syncs.organization_id = ?", organizationID).
		Where("syncs.deactivated_at IS NULL").
		Order("syncs.created_at ASC").
		Find(&sync)

	if result.Error != nil {
		return nil, result.Error
	}

	return sync, nil
}
