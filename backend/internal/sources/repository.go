package sources

import (
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateSource(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	connectionID int64,
	namespace *string,
	tableName *string,
	customJoin *string,
) (*models.Source, error) {

	source := models.Source{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionID:   connectionID,
	}

	if tableName != nil && namespace != nil {
		source.Namespace = database.NewNullString(*namespace)
		source.TableName = database.NewNullString(*tableName)
	} else if customJoin != nil {
		source.CustomJoin = database.NewNullString(*customJoin)
	}

	result := db.Create(&source)
	if result.Error != nil {
		return nil, result.Error
	}

	return &source, nil
}

func LoadSourceByID(db *gorm.DB, organizationID int64, sourceID int64) (*models.Source, error) {
	var source models.Source
	result := db.Table("sources").
		Select("sources.*").
		Where("sources.id = ?", sourceID).
		Where("sources.organization_id = ?", organizationID).
		Where("sources.deactivated_at IS NULL").
		Take(&source)

	if result.Error != nil {
		return nil, result.Error
	}

	return &source, nil
}

func LoadAllSources(
	db *gorm.DB,
	organizationID int64,
) ([]models.Source, error) {
	var source []models.Source
	result := db.Table("sources").
		Select("sources.*").
		Where("sources.organization_id = ?", organizationID).
		Where("sources.deactivated_at IS NULL").
		Order("sources.created_at ASC").
		Find(&source)

	if result.Error != nil {
		return nil, result.Error
	}

	return source, nil
}
