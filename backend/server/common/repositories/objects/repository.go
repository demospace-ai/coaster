package objects

import (
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func CreateObject(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	destinationID int64,
	namespace string,
	tableName string,
	endCustomerIdColumn string,
) (*models.Object, error) {

	object := models.Object{
		OrganizationID:      organizationID,
		DisplayName:         displayName,
		DestinationID:       destinationID,
		Namespace:           namespace,
		TableName:           tableName,
		EndCustomerIdColumn: endCustomerIdColumn,
	}

	result := db.Create(&object)
	if result.Error != nil {
		return nil, result.Error
	}

	return &object, nil
}

func LoadObjectByID(db *gorm.DB, organizationID int64, objectID int64) (*models.Object, error) {
	var object models.Object
	result := db.Table("objects").
		Select("objects.*").
		Where("objects.id = ?", objectID).
		Where("objects.organization_id = ?", organizationID).
		Where("objects.deactivated_at IS NULL").
		Take(&object)

	if result.Error != nil {
		return nil, result.Error
	}

	return &object, nil
}

func LoadAllObjects(
	db *gorm.DB,
	organizationID int64,
) ([]models.Object, error) {
	var objects []models.Object
	result := db.Table("objects").
		Select("objects.*").
		Where("objects.organization_id = ?", organizationID).
		Where("objects.deactivated_at IS NULL").
		Order("objects.created_at ASC").
		Find(&objects)

	if result.Error != nil {
		return nil, result.Error
	}

	return objects, nil
}

func CreateObjectFields(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	objectFields []input.ObjectField,
) ([]models.ObjectField, error) {
	var createdObjectFields []models.ObjectField
	for _, objectField := range objectFields {
		objectFieldModel := models.ObjectField{
			ObjectID: objectID,
			Name:     objectField.Name,
			Type:     objectField.Type,
			Omit:     objectField.Omit,
			Optional: objectField.Optional,
		}
		if objectField.DisplayName != nil {
			objectFieldModel.DisplayName = database.NewNullString(*objectField.DisplayName)
		}
		if objectField.Description != nil {
			objectFieldModel.Description = database.NewNullString(*objectField.Description)
		}

		result := db.Create(&objectFieldModel)
		if result.Error != nil {
			return nil, result.Error
		}
		createdObjectFields = append(createdObjectFields, objectFieldModel)
	}

	return createdObjectFields, nil
}

func LoadObjectFieldsByID(
	db *gorm.DB,
	objectID int64,
) ([]models.ObjectField, error) {
	var objectFields []models.ObjectField
	result := db.Table("object_fields").
		Select("object_fields.*").
		Where("object_fields.object_id = ?", objectID).
		Where("object_fields.deactivated_at IS NULL").
		Order("object_fields.created_at ASC").
		Find(&objectFields)

	if result.Error != nil {
		return nil, result.Error
	}

	return objectFields, nil
}
