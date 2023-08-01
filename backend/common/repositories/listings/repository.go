package listings

import (
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func LoadByID(db *gorm.DB, listingID int64) (*models.Listing, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.id = ?", listingID).
		Where("listings.deactivated_at IS NULL").
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadByID)")
	}

	return &listing, nil
}

func LoadAllByUserID(db *gorm.DB, userID int64) ([]models.Listing, error) {
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.user_id = ?", userID).
		Where("listings.deactivated_at IS NULL").
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadAllByUserID)")
	}

	return listings, nil
}

func CreateListing(db *gorm.DB, userID int64, name string, description string, category models.Category, price int64, location string, coordinates geo.Point) (*models.Listing, error) {
	listing := models.Listing{
		UserID:      userID,
		Name:        name,
		Description: description,
		Category:    category,
		Price:       price,
		Location:    location,
		Coordinates: coordinates,
	}

	result := db.Create(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListing)")
	}

	return &listing, nil
}

func LoadListingsWithinRadius(db *gorm.DB, coordinates geo.Point, radius int64) ([]models.Listing, error) {
	var listings []models.Listing
	result := db.Raw("SELECT * FROM listings WHERE ST_DWithin(?, listings.coordinates::Geography, ?);", coordinates, radius).Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadListingsWithinRadius)")
	}

	return listings, nil
}
