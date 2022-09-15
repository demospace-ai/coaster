package eventsets

import (
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateEventSet(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	connectionID int64,
	datasetName string,
	tableName string,
	eventTypeColumn string,
	timestampColumn string,
	userIdentifierColumn string,
) (*models.EventSet, error) {

	eventSet := models.EventSet{
		OrganizationID:       organizationID,
		DisplayName:          displayName,
		ConnectionID:         connectionID,
		DatasetName:          datasetName,
		TableName:            tableName,
		EventTypeColumn:      eventTypeColumn,
		TimestampColumn:      timestampColumn,
		UserIdentifierColumn: userIdentifierColumn,
	}

	result := db.Create(&eventSet)
	if result.Error != nil {
		return nil, result.Error
	}

	return &eventSet, nil
}
