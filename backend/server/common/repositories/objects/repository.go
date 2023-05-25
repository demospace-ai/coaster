package objects

import (
	"encoding/json"
	"fmt"

	"go.fabra.io/server/common/data"
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

func CreateObjectField(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	objectField input.ObjectField,
) (*models.ObjectField, error) {
	objectFieldModel := models.ObjectField{
		ObjectID:    objectID,
		Name:        objectField.Name,
		Type:        objectField.Type,
		Omit:        objectField.Omit,
		Optional:    objectField.Optional,
		DisplayName: database.NewNullStringFromPtr(objectField.DisplayName),
		Description: database.NewNullStringFromPtr(objectField.Description),
	}
	result := db.Create(&objectFieldModel)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(objects.CreateObjectFields)")
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
			return nil, err
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

type PartialUpdateObjectInput struct {
	DisplayName        *string                `json:"display_name"`
	DestinationID      *int64                 `json:"destination_id"`
	TargetType         *models.TargetType     `json:"target_type"`
	SyncMode           *models.SyncMode       `json:"sync_mode"`
	EndCustomerIDField *string                `json:"end_customer_id_field"`
	Frequency          *int64                 `json:"frequency"`
	FrequencyUnits     *models.FrequencyUnits `json:"frequency_units"`
	NamespaceRaw       json.RawMessage        `json:"namespace_raw"`
	TableNameRaw       json.RawMessage        `json:"table_name_raw"`
	PrimaryKeyRaw      json.RawMessage        `json:"primary_key_raw"`
	CursorFieldRaw     json.RawMessage        `json:"cursor_field_raw"`
}

func PartialUpdateObject(
	db *gorm.DB,
	organizationID int64,
	objectID int64,
	input PartialUpdateObjectInput,
) (*models.Object, error) {
	var object models.Object
	db.First(&object, objectID)

	if input.DisplayName != nil {
		object.DisplayName = *input.DisplayName
	}
	if input.DestinationID != nil {
		object.DestinationID = *input.DestinationID
	}
	if input.TargetType != nil {
		object.TargetType = *input.TargetType
	}
	if input.SyncMode != nil {
		object.SyncMode = *input.SyncMode
	}
	if input.EndCustomerIDField != nil {
		object.EndCustomerIDField = *input.EndCustomerIDField
	}
	if input.Frequency != nil {
		object.Frequency = *input.Frequency
	}
	if input.FrequencyUnits != nil {
		object.FrequencyUnits = *input.FrequencyUnits
	}
	setNullStringFromRaw(input.NamespaceRaw, &object.Namespace)
	setNullStringFromRaw(input.TableNameRaw, &object.TableName)
	setNullStringFromRaw(input.PrimaryKeyRaw, &object.PrimaryKey)
	setNullStringFromRaw(input.CursorFieldRaw, &object.CursorField)
	result := db.Save(&object)
	if result.Error != nil {
		return nil, result.Error
	}

	return &object, nil
}

// Assigns the database.NullString based on the key is null, "", or does not exist.
// For example:
// { input: null } sets stringVal to null
// { input: "" } sets stringVal to ""
// { } leaves the stringVal unchanged
func setNullStringFromRaw(input json.RawMessage, stringVal *database.NullString) error {
	fmt.Println("input", string(input))
	if len(input) > 0 { // if key exists in JSON input
		if string(input) == "null" { // value is null
			*stringVal = database.NullString{}
		} else {
			var nativeString string
			err := json.Unmarshal(input, &nativeString)
			if err != nil {
				return err
			}
			*stringVal = database.NewNullString(nativeString)
		}
	}
	return nil
}

type PartialUpdateObjectFieldInput struct {
	Name           *string         `json:"name"`
	Type           *data.FieldType `json:"type"`
	Omit           *bool           `json:"omit"`
	Optional       *bool           `json:"optional"`
	DisplayNameRaw json.RawMessage `json:"display_name"`
	DescriptionRaw json.RawMessage `json:"description"`
}

func PartialUpdateObjectField(
	db *gorm.DB,
	organizationID int64,
	objectFieldID int64,
	input PartialUpdateObjectFieldInput,
) (*models.ObjectField, error) {
	var objectField models.ObjectField
	result := db.First(&objectField, objectFieldID)
	if result.Error != nil {
		return nil, result.Error
	}
	if input.Name != nil {
		objectField.Name = *input.Name
	}
	if input.Type != nil {
		objectField.Type = *input.Type
	}
	if input.Omit != nil {
		objectField.Omit = *input.Omit
	}
	if input.Optional != nil {
		objectField.Optional = *input.Optional
	}
	setNullStringFromRaw(input.DisplayNameRaw, &objectField.DisplayName)
	setNullStringFromRaw(input.DescriptionRaw, &objectField.Description)
	db.Save(&objectField)
	return &objectField, nil
}
