package objects

import (
	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func CreateObject(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	destinationID int64,
	targetType models.TargetType,
	namespace *string,
	tableName *string,
	syncMode models.SyncMode,
	cursorField *string,
	primaryKey *string,
	endCustomerIDColumn string,
	frequency int64,
	frequencyUnits models.FrequencyUnits,
) (*models.Object, error) {

	object := models.Object{
		OrganizationID:     organizationID,
		DisplayName:        displayName,
		DestinationID:      destinationID,
		TargetType:         targetType,
		SyncMode:           syncMode,
		EndCustomerIDField: endCustomerIDColumn,
		Frequency:          frequency,
		FrequencyUnits:     frequencyUnits,
	}

	if namespace != nil {
		object.Namespace = database.NewNullString(*namespace)
	}

	if tableName != nil {
		object.TableName = database.NewNullString(*tableName)
	}

	if cursorField != nil {
		object.CursorField = database.NewNullString(*cursorField)
	}

	if primaryKey != nil {
		object.PrimaryKey = database.NewNullString(*primaryKey)
	}

	result := db.Create(&object)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.CreateObject)")
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
		return nil, errors.Wrap(result.Error, "(objects.LoadObjectByID)")
	}

	return &object, nil
}

func LoadObjectsByIDs(db *gorm.DB, organizationID int64, objectIDs []int64) ([]models.Object, error) {
	var objects []models.Object
	result := db.Table("objects").
		Select("objects.*").
		Where("objects.id IN ?", objectIDs).
		Where("objects.organization_id = ?", organizationID).
		Where("objects.deactivated_at IS NULL").
		Order("objects.created_at ASC").
		Find(&objects)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.LoadObjectsByIDs)")
	}

	return objects, nil
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
		return nil, errors.Wrap(result.Error, "(objects.LoadAllObjects)")
	}

	return objects, nil
}

// OrganizationID is used to check that the object belongs to the organization.
func CreateObjectField(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	objectField input.ObjectField,
) (*models.ObjectField, error) {
	// Verify the object belongs to the organization
	var object models.Object
	result := db.Where(&models.Object{
		OrganizationID: organizationID,
		BaseModel:      models.BaseModel{ID: objectID},
	}).First(&object)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.CreateObjectField)")
	}

	objectFieldModel := models.ObjectField{
		ObjectID:    objectID,
		Name:        objectField.Name,
		Type:        objectField.Type,
		Omit:        objectField.Omit,
		Optional:    objectField.Optional,
		DisplayName: database.NewNullStringFromPtr(objectField.DisplayName),
		Description: database.NewNullStringFromPtr(objectField.Description),
	}
	result = db.Create(&objectFieldModel)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.CreateObjectField)")
	}
	return &objectFieldModel, nil
}

func CreateObjectFields(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	objectFields []input.ObjectField,
) ([]models.ObjectField, error) {
	var createdObjectFields []models.ObjectField
	for _, objectField := range objectFields {
		objectFieldModel, err := CreateObjectField(db, organizationID, objectID, objectField)
		if err != nil {
			return nil, errors.Wrap(err, "(objects.CreateObjectFields)")
		}
		createdObjectFields = append(createdObjectFields, *objectFieldModel)
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
		return nil, errors.Wrap(result.Error, "(objects.LoadObjectFieldsByID)")
	}

	return objectFields, nil
}

// PartialUpdateObject updates the object with the given ID. The organizationID
// is used to ensure that the object belongs to the given organization.
func PartialUpdateObject(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	objectUpdates input.PartialUpdateObjectInput,
) (*models.Object, error) {
	var object models.Object
	result := db.Where(&models.Object{
		OrganizationID: organizationID,
		BaseModel:      models.BaseModel{ID: objectID},
	}).First(&object)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.PartialUpdateObject)")
	}
	if objectUpdates.DisplayName != nil {
		object.DisplayName = *objectUpdates.DisplayName
	}
	if objectUpdates.Frequency != nil {
		object.Frequency = *objectUpdates.Frequency
	}
	if objectUpdates.FrequencyUnits != nil {
		object.FrequencyUnits = *objectUpdates.FrequencyUnits
	}

	// Explicitly do not allow updating the destination, sync mode, primary key, or cursor field
	// since that may affect running syncs. TODO: do this safely
	result = db.Save(&object)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.PartialUpdateObject)")
	}

	return &object, nil
}

// Partially updates an object field. OrganizationID and ObjectID are used to
// ensure the object field belongs to the organization and object.
func PartialUpdateObjectField(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	objectFieldUpdates input.PartialUpdateObjectField,
) (*models.ObjectField, error) {
	// Verify the object belongs to the organization
	var object models.Object
	result := db.Where(&models.Object{
		OrganizationID: organizationID,
		BaseModel:      models.BaseModel{ID: objectID},
	}).First(&object)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.PartialUpdateObjectField)")
	}

	var objectField models.ObjectField
	result = db.Where(&models.ObjectField{
		ObjectID:  objectID,
		BaseModel: models.BaseModel{ID: objectFieldUpdates.ID},
	}).First(&objectField)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.PartialUpdateObjectField)")
	}

	// Explicitly do not allow updating the name, type, omit, or optional since that may affect running syncs. TODO: do this safely
	database.SetNullStringFromRaw(objectFieldUpdates.DisplayNameRaw, &objectField.DisplayName)
	database.SetNullStringFromRaw(objectFieldUpdates.DescriptionRaw, &objectField.Description)
	result = db.Save(&objectField)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.PartialUpdateObjectField)")
	}
	return &objectField, nil
}
