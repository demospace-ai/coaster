package listings

import (
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

type ListingAndImages struct {
	models.Listing
	Images []models.ListingImage
}

func LoadByID(db *gorm.DB, listingID int64) (*ListingAndImages, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.id = ?", listingID).
		Where("listings.deactivated_at IS NULL").
		Where("listings.published = TRUE").
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadByID)")
	}

	images, err := LoadImagesForListing(db, listingID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.LoadByID) getting images")
	}

	return &ListingAndImages{
		listing,
		images,
	}, nil
}

func LoadAllByUserID(db *gorm.DB, userID int64) ([]ListingAndImages, error) {
	// No need to check if the listings are published since the user can always see their own listings
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.user_id = ?", userID).
		Where("listings.deactivated_at IS NULL").
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadAllByUserID)")
	}

	listingsAndImages := make([]ListingAndImages, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadAllByUserID) getting images")
		}
		listingsAndImages[i] = ListingAndImages{
			listing,
			images,
		}
	}

	return listingsAndImages, nil
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
		Published:   false,
	}

	result := db.Create(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListing)")
	}

	return &listing, nil
}

func CreateListingImage(db *gorm.DB, listingID int64, storageID string) (*models.ListingImage, error) {
	listingImage := models.ListingImage{
		ListingID: listingID,
		StorageID: storageID,
	}

	result := db.Create(&listingImage)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListingImage)")
	}

	return &listingImage, nil
}

func LoadImagesForListing(db *gorm.DB, listingID int64) ([]models.ListingImage, error) {
	var listingImages []models.ListingImage
	result := db.Table("listing_images").
		Select("listing_images.*").
		Where("listing_images.listing_id = ?", listingID).
		Find(&listingImages)
	if result.Error != nil {
		// Not guaranteed to have any images for a listing so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.ListingImage{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(listings.GetImagesForListing)")
		}
	}

	return listingImages, nil
}

func LoadListingsWithinRadius(db *gorm.DB, coordinates geo.Point, radius int64) ([]ListingAndImages, error) {
	var listings []models.Listing
	result := db.Raw("SELECT * FROM listings WHERE ST_DWithin(?, listings.coordinates::Geography, ?) AND listings.published = TRUE;", coordinates, radius).Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadListingsWithinRadius)")
	}

	listingsAndImages := make([]ListingAndImages, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadAllByUserID) getting images")
		}
		listingsAndImages[i] = ListingAndImages{
			listing,
			images,
		}
	}

	return listingsAndImages, nil
}
