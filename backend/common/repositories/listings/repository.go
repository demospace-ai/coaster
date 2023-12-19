package listings

import (
	"slices"
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/availability_rules"
	"go.fabra.io/server/common/repositories/itinerary_steps"
	"go.fabra.io/server/common/repositories/users"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ListingDetails struct {
	models.Listing
	Host           *models.User
	Images         []models.ListingImage
	Categories     []models.ListingCategory
	ItinerarySteps []models.ItineraryStep
}

type ListingMetadata struct {
	ID        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
}

func LoadDetailsByIDAndUser(db *gorm.DB, listingID int64, user *models.User) (*ListingDetails, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.id = ?", listingID).
		Where("listings.deactivated_at IS NULL").
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(listings.LoadByID) error for ID %d", listingID)
	}

	// Allow the owner to see their own listing regardless of status
	if listing.Status != models.ListingStatusPublished {
		if user == nil || (listing.UserID != user.ID && !user.IsAdmin) {
			return nil, gorm.ErrRecordNotFound
		}
	}

	return loadDetailsForListing(db, listing)
}

func LoadByIDAndUser(db *gorm.DB, listingID int64, user *models.User) (*models.Listing, error) {
	var listing models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.id = ?", listingID).
		Where("listings.deactivated_at IS NULL").
		Take(&listing)
	if result.Error != nil {
		return nil, errors.Wrapf(result.Error, "(listings.LoadByID) error for ID %d", listingID)
	}

	// Allow the owner to see their own listing regardless of status
	if listing.Status != models.ListingStatusPublished {
		if user == nil || (listing.UserID != user.ID && !user.IsAdmin) {
			return nil, gorm.ErrRecordNotFound
		}
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
		Order("listings.created_at ASC").
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadAllByUserID)")
	}

	host, err := users.LoadUserByID(db, userID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.LoadAllByUserID) getting host")
	}

	listingDetails := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		images, err := LoadImagesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadAllByUserID) getting images")
		}

		categories, err := LoadCategoriesForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadByID) getting categories")
		}

		itinerarySteps, err := itinerary_steps.LoadItineraryForListing(db, listing.ID)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadByID) getting itinerary")
		}

		listingDetails[i] = ListingDetails{
			listing,
			host,
			images,
			categories,
			itinerarySteps,
		}
	}

	return listingDetails, nil
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
		return nil, errors.Wrap(result.Error, "(listings.GetDraftListing)")
	}

	return loadDetailsForListing(db, listing)
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
	categories []models.ListingCategoryType,
	price *int64,
	location *string,
	coordinates *geo.Point,
) (*models.Listing, error) {
	listing := models.Listing{
		UserID:              userID,
		Name:                name,
		Description:         input.SanitizePtr(description),
		Price:               price,
		Location:            location,
		Coordinates:         coordinates,
		Status:              models.ListingStatusDraft,
		Cancellation:        models.ListingCancellationFlexible,
		Highlights:          []string{},
		Includes:            []string{},
		NotIncluded:         []string{},
		AvailabilityType:    models.AvailabilityTypeDate,
		AvailabilityDisplay: models.AvailabilityDisplayCalendar,
	}

	result := db.Create(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListing)")
	}

	for _, category := range categories {
		if slices.Contains(models.SPECIAL_CATEGORIES, category) {
			continue
		}

		result := db.Create(&models.ListingCategory{
			ListingID: listing.ID,
			Category:  category,
		})
		if result.Error != nil {
			return nil, errors.Wrap(result.Error, "(listings.CreateListing) creating category")
		}
	}

	return &listing, nil
}

func UpdateListing(db *gorm.DB, listing *models.Listing, listingUpdates input.Listing) (*ListingDetails, error) {
	if listingUpdates.Name != nil {
		listing.Name = listingUpdates.Name
	}

	if listingUpdates.Description != nil {
		listing.Description = input.SanitizePtr(listingUpdates.Description)
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

	if listingUpdates.DurationMinutes != nil {
		listing.DurationMinutes = listingUpdates.DurationMinutes
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

	if listingUpdates.NotIncluded != nil {
		listing.NotIncluded = listingUpdates.NotIncluded
	}

	if listingUpdates.AvailabilityType != nil {
		if listing.AvailabilityType != *listingUpdates.AvailabilityType {
			listing.AvailabilityType = *listingUpdates.AvailabilityType
			err := availability_rules.DeactivateAllForListing(db, listing.ID)
			if err != nil {
				return nil, errors.Wrap(err, "(listings.UpdateListing) deactivating availability rules")
			}
		}
	}

	if listingUpdates.AvailabilityDisplay != nil {
		listing.AvailabilityDisplay = *listingUpdates.AvailabilityDisplay
	}

	// TODO: only admins can make the status published
	if listingUpdates.Status != nil && *listingUpdates.Status != models.ListingStatusPublished {
		listing.Status = *listingUpdates.Status
	}

	result := db.Save(&listing)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.UpdateListing)")
	}

	if listingUpdates.Categories != nil {
		err := updateListingCategories(db, listing.ID, listingUpdates.Categories)
		if err != nil {
			return nil, errors.Wrap(err, "(api.UpdateListing) updating listing categories")
		}
	}

	return loadDetailsForListing(db, *listing)
}

func updateListingCategories(db *gorm.DB, listingID int64, categories []models.ListingCategoryType) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		result := tx.Model(&models.ListingCategory{}).Where("listing_id = ?", listingID).Where("category NOT IN ?", models.SPECIAL_CATEGORIES).Update("deactivated_at", time.Now())
		if result.Error != nil {
			return errors.Wrap(result.Error, "(listings.UpdateListingCategories) deleting old categories")
		}

		for _, category := range categories {
			if slices.Contains(models.SPECIAL_CATEGORIES, category) {
				continue
			}

			result := tx.Create(&models.ListingCategory{
				ListingID: listingID,
				Category:  category,
			})
			if result.Error != nil {
				return errors.Wrap(result.Error, "(listings.UpdateListingCategories) creating category")
			}
		}

		return nil
	})

	if err != nil {
		return errors.Wrap(err, "(listings.UpdateListingCategories) updating categories")
	}

	return nil
}

func CreateListingImage(db *gorm.DB, listingID int64, storageID string, rank int, width int, height int) (*models.ListingImage, error) {
	listingImage := models.ListingImage{
		ListingID: listingID,
		StorageID: storageID,
		Rank:      rank,
		Width:     width,
		Height:    height,
	}

	result := db.Create(&listingImage)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.CreateListingImage)")
	}

	return &listingImage, nil
}

func DeleteListing(db *gorm.DB, listing *models.Listing) error {
	currentTime := time.Now()
	result := db.Model(listing).Update("deactivated_at", currentTime)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(listings.DeleteListing)")
	}

	return nil
}

func DeleteListingImage(db *gorm.DB, listingImage *models.ListingImage) error {
	currentTime := time.Now()
	result := db.Model(listingImage).Update("deactivated_at", currentTime)
	if result.Error != nil {
		return errors.Wrap(result.Error, "(listings.DeleteListingImage)")
	}

	return nil
}

func LoadListingImage(db *gorm.DB, listingID int64, imageID int64) (*models.ListingImage, error) {
	var listingImage models.ListingImage
	result := db.Table("listing_images").
		Select("listing_images.*").
		Where("listing_images.listing_id = ?", listingID).
		Where("listing_images.id = ?", imageID).
		Where("listing_images.deactivated_at IS NULL").
		Take(&listingImage)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.GetImagesForListing)")
	}

	return &listingImage, nil
}

func UpdateImageRank(db *gorm.DB, listingID int64, imageID int64, rank int) error {
	result := db.Table("listing_images").
		Where("listing_images.listing_id = ?", listingID).
		Where("listing_images.id = ?", imageID).
		Update("rank", rank)

	if result.Error != nil {
		return errors.Wrap(result.Error, "(listings.DeleteListingImage)")
	}

	return nil
}

func LoadImagesForListing(db *gorm.DB, listingID int64) ([]models.ListingImage, error) {
	var listingImages []models.ListingImage
	result := db.Table("listing_images").
		Select("listing_images.*").
		Where("listing_images.listing_id = ?", listingID).
		Where("listing_images.deactivated_at IS NULL").
		Order("listing_images.rank ASC").
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

	listingDetails := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		details, err := loadDetailsForListing(db, listing)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadListingsWithinRadius) loading details")
		}

		listingDetails[i] = *details
	}

	return listingDetails, nil
}

func LoadListingsForQuery(db *gorm.DB, query string) ([]ListingDetails, error) {
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.ts @@ to_tsquery('english', replace(?, ' ', '|'))", query).
		Where("listings.status = ?", models.ListingStatusPublished).
		Clauses(clause.OrderBy{
			Expression: clause.Expr{SQL: "ts_rank(ts, to_tsquery('english', replace(?, ' ', '|'))) DESC", Vars: []interface{}{query}},
		}).
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadListingsForQuery)")
	}

	listingDetails := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		details, err := loadDetailsForListing(db, listing)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadListingsForQuery) loading details")
		}

		listingDetails[i] = *details
	}

	return listingDetails, nil
}

func LoadFeatured(db *gorm.DB) ([]ListingDetails, error) {
	return LoadListingsByCategory(db, []models.ListingCategoryType{models.CategoryFeatured})
}

func LoadByDuration(db *gorm.DB, durationMinutes int64) ([]ListingDetails, error) {
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Where("listings.status = ?", models.ListingStatusPublished).
		Where("listings.duration_minutes <= ?", durationMinutes).
		Where("listings.deactivated_at IS NULL").
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadDayTrips)")
	}

	listingDetails := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		details, err := loadDetailsForListing(db, listing)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadByDuration) loading details")
		}

		listingDetails[i] = *details
	}

	return listingDetails, nil
}

func LoadListingsByCategory(db *gorm.DB, categories []models.ListingCategoryType) ([]ListingDetails, error) {
	var listings []models.Listing
	result := db.Table("listings").
		Select("listings.*").
		Joins("JOIN listing_categories ON listing_categories.listing_id = listings.id").
		Where("listings.status = ?", models.ListingStatusPublished).
		Where("listing_categories.category IN ?", categories).
		Where("listings.deactivated_at IS NULL").
		Where("listing_categories.deactivated_at IS NULL").
		Find(&listings)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadListingsByCategory)")
	}

	listingDetails := make([]ListingDetails, len(listings))
	for i, listing := range listings {
		details, err := loadDetailsForListing(db, listing)
		if err != nil {
			return nil, errors.Wrap(err, "(listings.LoadListingsByCategory) loading details")
		}

		listingDetails[i] = *details
	}

	return listingDetails, nil
}

func LoadAllPublishedMetadata(db *gorm.DB) ([]ListingMetadata, error) {
	var listingMetadataList []ListingMetadata
	result := db.Table("listings").
		Select("listings.id", "listings.updated_at").
		Where("listings.status = ?", models.ListingStatusPublished).
		Where("listings.deactivated_at IS NULL").
		Find(&listingMetadataList)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "(listings.LoadAllPublishedIDs)")
	}

	return listingMetadataList, nil
}

func LoadCategoriesForListing(db *gorm.DB, listingID int64) ([]models.ListingCategory, error) {
	var listingCategories []models.ListingCategory
	result := db.Table("listing_categories").
		Select("listing_categories.*").
		Where("listing_categories.listing_id = ?", listingID).
		Where("listing_categories.deactivated_at IS NULL").
		Find(&listingCategories)
	if result.Error != nil {
		// TODO: this shouldn't happen. Should we return an error?
		if errors.IsRecordNotFound(result.Error) {
			return []models.ListingCategory{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(listings.LoadCategoriesForListing)")
		}
	}

	return listingCategories, nil
}

func loadDetailsForListing(db *gorm.DB, listing models.Listing) (*ListingDetails, error) {
	host, err := users.LoadUserByID(db, listing.UserID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.loadDetailsForListing) getting host")
	}

	images, err := LoadImagesForListing(db, listing.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.loadDetailsForListing) getting images")
	}

	categories, err := LoadCategoriesForListing(db, listing.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.loadDetailsForListing) getting categories")
	}

	itinerarySteps, err := itinerary_steps.LoadItineraryForListing(db, listing.ID)
	if err != nil {
		return nil, errors.Wrap(err, "(listings.LoadByID) getting itinerary")
	}

	return &ListingDetails{
		listing,
		host,
		images,
		categories,
		itinerarySteps,
	}, nil
}
