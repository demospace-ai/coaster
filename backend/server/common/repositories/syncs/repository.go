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
	sourceID int64,
	objectID int64,
	namespace *string,
	tableName *string,
	customJoin *string,
	cursorField *string,
	primaryKey *string,
	syncMode models.SyncMode,
	frequency int64,
	frequencyUnits models.FrequencyUnits,
) (*models.Sync, error) {

	sync := models.Sync{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		EndCustomerId:  endCustomerID,
		SourceID:       sourceID,
		ObjectID:       objectID,
		SyncMode:       syncMode,
		Frequency:      frequency,
		FrequencyUnits: frequencyUnits,
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
	fieldMappings []input.FieldMapping,
) ([]models.FieldMapping, error) {
	// TODO: validate that the mapped object fields belong to the right object
	var createdFieldMappings []models.FieldMapping
	for _, fieldMapping := range fieldMappings {
		fieldMappingModel := models.FieldMapping{
			SyncID:             syncID,
			SourceFieldName:    fieldMapping.SourceFieldName,
			DestinationFieldId: fieldMapping.DestinationFieldId,
		}

		result := db.Create(&fieldMappingModel)
		if result.Error != nil {
			return nil, result.Error
		}
		createdFieldMappings = append(createdFieldMappings, fieldMappingModel)
	}

	return createdFieldMappings, nil
}

func LoadSyncByID(db *gorm.DB, organizationID int64, syncID int64) (*models.Sync, error) {
	var sync models.Sync
	result := db.Table("syncs").
		Select("syncs.*").
		Where("syncs.id = ?", syncID).
		Where("syncs.organization_id = ?", organizationID).
		Where("syncs.deactivated_at IS NULL").
		Take(&sync)

	if result.Error != nil {
		return nil, result.Error
	}

	return &sync, nil
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

func LoadFieldMappingsForSync(
	db *gorm.DB,
	organizationID int64,
	syncID int64,
) ([]models.FieldMapping, error) {
	// TODO: validate that the mapped object fields belong to the right object
	var fieldMappings []models.FieldMapping
	result := db.Table("field_mappings").
		Select("field_mappings.*").
		Where("field_mappings.sync_id = ?", syncID).
		Where("field_mappings.organization_id = ?", organizationID).
		Where("field_mappings.deactivated_at IS NULL").
		Find(&fieldMappings)

	if result.Error != nil {
		return nil, result.Error
	}

	return fieldMappings, nil
}
