package demoDestinations

import (
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func LoadDemoDestinationByID(db *gorm.DB, organizationID int64, demoDestinationID int64) (*models.DemoDestination, error) {
	var demoDestination models.DemoDestination
	result := db.Table("demo_destinations").
		Select("demo_destinations.*").
		Where("demo_destinations.id = ?", demoDestinationID).
		Where("connections.organization_id = ?", organizationID).
		Where("connections.deactivated_at IS NULL").
		Take(&demoDestination)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(connections.LoadDemoDestinationByID)")
	}

	return &demoDestination, nil
}

func WriteNewSyncToDemoDestination(db *gorm.DB, demoDestinationID int64, syncData *string) (*models.DemoDestination, error) {
	var demoDestination models.DemoDestination
	result := db.Table("demo_destinations").
		Select("demo_destinations.*").
		Where("demo_destinations.id = ?", demoDestinationID).
		Take(&demoDestination)

	db.Model(&demoDestination).Update("last_written_sync", syncData)

	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(connections.WriteNewSyncToDemoDestination)")
	}

	return &demoDestination, nil
}
