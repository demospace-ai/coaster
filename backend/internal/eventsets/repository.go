package eventsets

import (
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateEventSet(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	connectionID int64,
	datasetName *string,
	tableName *string,
	customJoin *string,
	eventTypeColumn string,
	timestampColumn string,
	userIdentifierColumn string,
) (*models.EventSet, error) {

	eventSet := models.EventSet{
		OrganizationID:       organizationID,
		DisplayName:          displayName,
		ConnectionID:         connectionID,
		EventTypeColumn:      eventTypeColumn,
		TimestampColumn:      timestampColumn,
		UserIdentifierColumn: userIdentifierColumn,
	}

	if tableName != nil && datasetName != nil {
		eventSet.DatasetName = database.NewNullString(*datasetName)
		eventSet.TableName = database.NewNullString(*tableName)
	} else if customJoin != nil {
		eventSet.CustomJoin = database.NewNullString(*customJoin)
	}

	result := db.Create(&eventSet)
	if result.Error != nil {
		return nil, result.Error
	}

	return &eventSet, nil
}

func LoadEventSetByID(db *gorm.DB, organizationID int64, eventSetID int64) (*models.EventSet, error) {
	var eventSet models.EventSet
	result := db.Table("event_sets").
		Select("event_sets.*").
		Where("event_sets.id = ?", eventSetID).
		Where("event_sets.organization_id = ?", organizationID).
		Where("event_sets.deactivated_at IS NULL").
		Take(&eventSet)

	if result.Error != nil {
		return nil, result.Error
	}

	return &eventSet, nil
}

func LoadAllEventSets(
	db *gorm.DB,
	organizationID int64,
) ([]models.EventSet, error) {
	var eventSets []models.EventSet
	result := db.Table("event_sets").
		Select("event_sets.*").
		Where("event_sets.organization_id = ?", organizationID).
		Where("event_sets.deactivated_at IS NULL").
		Order("event_sets.created_at ASC").
		Find(&eventSets)

	if result.Error != nil {
		return nil, result.Error
	}

	return eventSets, nil
}
