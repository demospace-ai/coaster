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
		Where("listings.status = ?", models.ListingStatusPublished).
		Where("listings.deactivated_at IS NULL").
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

func LoadByUserAndID(db *gorm.DB, userID int64, listingID int64) (*models.Listing, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.id = ?", listingID).
		Where("listings.user_id = ?", userID).
		Where("listings.deactivated_at IS NULL").
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadUserListingByID)")
	}

	return &listing, nil
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

func GetDraftListing(db *gorm.DB, userID int64) (*ListingAndImages, error) {
	existing, err := getExistingDraftListing(db, userID)
	if err == nil {
		return existing, nil
	} else if !errors.IsRecordNotFound(err) {
		return nil, err
	}

	listing := models.Listing{
		UserID:   userID,
		Status:   models.ListingStatusDraft,
		Featured: false,
	}

	result := db.Create(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListing)")
	}

	return &ListingAndImages{listing, []models.ListingImage{}}, nil
}

func getExistingDraftListing(db *gorm.DB, userID int64) (*ListingAndImages, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.user_id = ?", userID).
		Where("listings.deactivated_at IS NULL").
		Where("listings.status = ?", models.ListingStatusDraft).
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.getDraftListing)")
	}

	images, err := LoadImagesForListing(db, listing.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.getDraftListing) getting images")
	}

	return &ListingAndImages{
		listing,
		images,
	}, nil
}

func SubmitListing(db *gorm.DB, listing *models.Listing) error {
	result := db.Model(listing).Update("status", models.ListingStatusUnderReview)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(listings.SubmitListing)")
	}

	return nil
}

func CreateListing(db *gorm.DB, userID int64, name string, description string, category models.ListingCategory, price int64, location string, coordinates geo.Point) (*models.Listing, error) {
	listing := models.Listing{
		UserID:      userID,
		Name:        &name,
		Description: &description,
		Category:    &category,
		Price:       &price,
		Location:    &location,
		Coordinates: &coordinates,
		Status:      models.ListingStatusUnderReview,
		Featured:    false,
	}

	result := db.Create(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListing)")
	}

	return &listing, nil
}

func UpdateListing(db *gorm.DB, listing *models.Listing, name *string, description *string, category *models.ListingCategory, price *int64, location *string, coordinates *geo.Point, status *models.ListingStatus) (*models.Listing, error) {
	if name != nil {
		listing.Name = name
	}

	if description != nil {
		listing.Description = description
	}

	if category != nil {
		listing.Category = category
	}

	if price != nil {
		listing.Price = price
	}

	if location != nil && coordinates != nil {
		listing.Location = location
		listing.Coordinates = coordinates
	}

	// TODO: only admins can make the status published
	if status != nil && *status != models.ListingStatusPublished {
		listing.Status = *status
	}

	result := db.Save(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.UpdateListing)")
	}

	return listing, nil
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
	result := db.Raw("SELECT * FROM listings WHERE ST_DWithin(?, listings.coordinates::Geography, ?) AND listings.status = ?;", coordinates, radius, models.ListingStatusPublished).Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadListingsWithinRadius)")
	}

	listingsAndImages := make([]ListingAndImages, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadListingsWithinRadius) getting images")
		}
		listingsAndImages[i] = ListingAndImages{
			listing,
			images,
		}
	}

	return listingsAndImages, nil
}

func LoadFeatured(db *gorm.DB) ([]ListingAndImages, error) {
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.status = ?", models.ListingStatusPublished).
		Where("listings.featured = TRUE").
		Where("listings.deactivated_at IS NULL").
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadFeatured)")
	}

	listingsAndImages := make([]ListingAndImages, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadFeatured) getting images")
		}
		listingsAndImages[i] = ListingAndImages{
			listing,
			images,
		}
	}

	return listingsAndImages, nil
}
