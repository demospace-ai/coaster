package destinations

import (
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func CreateDestination(
	db *gorm.DB,
	organizationID int64,
	displayName string,
	connectionID int64,
) (*models.Destination, error) {

	destination := models.Destination{
		OrganizationID: organizationID,
		DisplayName:    displayName,
		ConnectionID:   connectionID,
	}

	result := db.Create(&destination)
	if result.Error != nil {
		return nil, result.Error
	}

	return &destination, nil
}

// TODO: test that connection credentials are not exposed
func LoadDestinationByID(db *gorm.DB, organizationID int64, destinationID int64) (*models.DestinationConnection, error) {
	var destinationConnection models.DestinationConnection
	result := db.Table("destinations").
		Select("destinations.*, connections.connection_type").
		Joins("JOIN connections ON destinations.connection_id = connections.id").
		Where("destinations.id = ?", destinationID).
		Where("destinations.organization_id = ?", organizationID).
		Where("destinations.deactivated_at IS NULL").
		Where("connections.deactivated_at IS NULL").
		Take(&destinationConnection)

	if result.Error != nil {
		return nil, result.Error
	}

	return &destinationConnection, nil
}

func LoadAllDestinations(
	db *gorm.DB,
	organizationID int64,
) ([]models.DestinationConnection, error) {
	var destinations []models.DestinationConnection
	result := db.Table("destinations").
		Select("destinations.*, connections.connection_type").
		Joins("JOIN connections ON destinations.connection_id = connections.id").
		Where("destinations.organization_id = ?", organizationID).
		Where("destinations.deactivated_at IS NULL").
		Order("destinations.created_at ASC").
		Where("connections.deactivated_at IS NULL").
		Find(&destinations)

	if result.Error != nil {
		return nil, result.Error
	}

	return destinations, nil
}
