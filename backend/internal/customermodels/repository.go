package customermodels

import (
	"fabra/internal/input"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateModel(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	destinationID int64,
	namespace string,
	tableName string,
	customerIdColumn string,
) (*models.Model, error) {

	model := models.Model{
		OrganizationID:   organizationID,
		DisplayName:      displayName,
		DestinationID:    destinationID,
		Namespace:        namespace,
		TableName:        tableName,
		CustomerIdColumn: customerIdColumn,
	}

	result := db.Create(&model)
	if result.Error != nil {
		return nil, result.Error
	}

	return &model, nil
}

func LoadModelByID(db *gorm.DB, organizationID int64, modelID int64) (*models.Model, error) {
	var model models.Model
	result := db.Table("models").
		Select("models.*").
		Where("models.id = ?", modelID).
		Where("models.organization_id = ?", organizationID).
		Where("models.deactivated_at IS NULL").
		Take(&model)

	if result.Error != nil {
		return nil, result.Error
	}

	return &model, nil
}

func LoadAllModels(
	db *gorm.DB,
	organizationID int64,
) ([]models.Model, error) {
	var models []models.Model
	result := db.Table("models").
		Select("models.*").
		Where("models.organization_id = ?", organizationID).
		Where("models.deactivated_at IS NULL").
		Order("models.created_at ASC").
		Find(&models)

	if result.Error != nil {
		return nil, result.Error
	}

	return models, nil
}

func CreateModelFields(
	db *gorm.DB,
	organizationID int64,
	modelID int64,
	modelFields []input.ModelField,
) ([]models.ModelField, error) {
	var createdModelFields []models.ModelField
	for _, modelField := range modelFields {
		modelFieldModel := models.ModelField{
			Name: modelField.Name,
			Type: modelField.Type,
		}

		result := db.Create(&modelFieldModel)
		if result.Error != nil {
			return nil, result.Error
		}
		createdModelFields = append(createdModelFields, modelFieldModel)
	}

	return createdModelFields, nil
}
