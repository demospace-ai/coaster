package listings

import (
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/users"
	"gorm.io/gorm"
)

type ListingDetails struct {
	models.Listing
	Host   *models.User
	Images []models.ListingImage
}

func LoadByID(db *gorm.DB, listingID int64, userID *int64) (*ListingDetails, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.id = ?", listingID).
		Where("listings.deactivated_at IS NULL").
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(listings.LoadByID) error for ID %d", listingID)
	}

	// Allow the owner to see their own listing even if it's not published
	if listing.Status != models.ListingStatusPublished {
		if userID == nil || listing.UserID != *userID {
			return nil, gorm.ErrRecordNotFound
		}
	}

	images, err := LoadImagesForListing(db, listingID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.LoadByID) getting images")
	}

	host, err := users.LoadUserByID(db, listing.UserID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.LoadByID) getting host")
	}

	return &ListingDetails{
		listing,
		host,
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

func LoadAllByUserID(db *gorm.DB, userID int64) ([]ListingDetails, error) {
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

	host, err := users.LoadUserByID(db, userID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.LoadAllByUserID) getting host")
	}

	listingsAndImages := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadAllByUserID) getting images")
		}

		listingsAndImages[i] = ListingDetails{
			listing,
			host,
			images,
		}
	}

	return listingsAndImages, nil
}

func GetDraftListing(db *gorm.DB, userID int64) (*ListingDetails, error) {
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

	host, err := users.LoadUserByID(db, userID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.getDraftListing) getting host")
	}

	return &ListingDetails{
		listing,
		host,
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

// TODO: pass other fields
func CreateListing(
	db *gorm.DB,
	userID int64,
	name *string,
	description *string,
	category *models.ListingCategory,
	price *int64,
	location *string,
	coordinates *geo.Point,
) (*models.Listing, error) {
	listing := models.Listing{
		UserID:       userID,
		Name:         name,
		Description:  description,
		Category:     category,
		Price:        price,
		Location:     location,
		Coordinates:  coordinates,
		Status:       models.ListingStatusDraft,
		Featured:     false,
		Cancellation: models.ListingCancellationFlexible,
		Highlights:   []string{},
		Includes:     []string{},
	}

	result := db.Create(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListing)")
	}

	return &listing, nil
}

func UpdateListing(db *gorm.DB, listing *models.Listing, listingUpdates input.Listing) (*models.Listing, error) {
	if listingUpdates.Name != nil {
		listing.Name = listingUpdates.Name
	}

	if listingUpdates.Description != nil {
		listing.Description = listingUpdates.Description
	}

	if listingUpdates.Category != nil {
		listing.Category = listingUpdates.Category
	}

	if listingUpdates.Price != nil {
		listing.Price = listingUpdates.Price
	}

	if listingUpdates.Location != nil && listingUpdates.Coordinates != nil {
		listing.Location = listingUpdates.Location
		listing.Coordinates = listingUpdates.Coordinates
	}

	if listingUpdates.ShortDescription != nil {
		listing.ShortDescription = listingUpdates.ShortDescription
	}

	if listingUpdates.Cancellation != nil {
		listing.Cancellation = *listingUpdates.Cancellation
	}

	if listingUpdates.DurationHours != nil {
		listing.DurationHours = listingUpdates.DurationHours
	}

	if listingUpdates.MaxGuests != nil {
		listing.MaxGuests = listingUpdates.MaxGuests
	}

	if listingUpdates.Highlights != nil {
		listing.Highlights = listingUpdates.Highlights
	}

	if listingUpdates.Includes != nil {
		listing.Includes = listingUpdates.Includes
	}

	// TODO: only admins can make the status published
	if listingUpdates.Status != nil && *listingUpdates.Status != models.ListingStatusPublished {
		listing.Status = *listingUpdates.Status
	}

	result := db.Save(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.UpdateListing)")
	}

	return listing, nil
}

func CreateListingImage(db *gorm.DB, listingID int64, storageID string, rank int) (*models.ListingImage, error) {
	listingImage := models.ListingImage{
		ListingID: listingID,
		StorageID: storageID,
		Rank:      rank,
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

func LoadListingsWithinRadius(db *gorm.DB, coordinates geo.Point, radius int64) ([]ListingDetails, error) {
	var listings []models.Listing
	result := db.Raw("SELECT * FROM listings WHERE ST_DWithin(?, listings.coordinates::Geography, ?) AND listings.status = ?;", coordinates, radius, models.ListingStatusPublished).Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadListingsWithinRadius)")
	}

	listingsAndImages := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadListingsWithinRadius) getting images")
		}

		host, err := users.LoadUserByID(db, listing.UserID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadListingsWithinRadius) getting host")
		}

		listingsAndImages[i] = ListingDetails{
			listing,
			host,
			images,
		}
	}

	return listingsAndImages, nil
}

func LoadFeatured(db *gorm.DB) ([]ListingDetails, error) {
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

	listingsAndImages := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadFeatured) getting images")
		}

		host, err := users.LoadUserByID(db, listing.UserID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadFeatured) getting host")
		}

		listingsAndImages[i] = ListingDetails{
			listing,
			host,
			images,
		}
	}

	return listingsAndImages, nil
}
