package views

import (
	"slices"

	image_lib "go.coaster.io/server/common/images"
	"go.coaster.io/server/common/models"
	"go.coaster.io/server/common/repositories/listings"
)

type Listing struct {
	ID                  int64                      `json:"id"`
	Name                *string                    `json:"name,omitempty"`
	Description         *string                    `json:"description,omitempty"`
	Price               *int64                     `json:"price,omitempty"`
	Location            *string                    `json:"location,omitempty"`
	Coordinates         *Coordinates               `json:"coordinates,omitempty"`
	PlaceID             *string                    `json:"place_id,omitempty"`
	City                *string                    `json:"city,omitempty"`
	Region              *string                    `json:"region,omitempty"`
	Country             *string                    `json:"country,omitempty"`
	PostalCode          *string                    `json:"postal_code,omitempty"`
	ShortDescription    *string                    `json:"short_description,omitempty"`
	Cancellation        models.ListingCancellation `json:"cancellation,omitempty"`
	DurationMinutes     *int64                     `json:"duration_minutes,omitempty"`
	MaxGuests           *int64                     `json:"max_guests,omitempty"`
	Highlights          []string                   `json:"highlights"`
	Includes            []string                   `json:"includes"`
	NotIncluded         []string                   `json:"not_included"`
	Status              models.ListingStatus       `json:"status"`
	AvailabilityType    models.AvailabilityType    `json:"availability_type"`
	AvailabilityDisplay models.AvailabilityDisplay `json:"availability_display"`

	Host Host `json:"host"`

	Images []Image `json:"images"`

	Categories []models.ListingCategoryType `json:"categories"`

	ItinerarySteps []models.ItineraryStep `json:"itinerary_steps"`
}

type Image struct {
	ID     int64  `json:"id"`
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type Category struct {
	ID       int64                      `json:"id"`
	Category models.ListingCategoryType `json:"category"`
}

type Host struct {
	ID                   int64   `json:"id"`
	FirstName            string  `json:"first_name"`
	LastName             string  `json:"last_name"`
	Email                string  `json:"email"`
	ProfilePictureURL    *string `json:"profile_picture_url"`
	ProfilePictureWidth  *int    `json:"profile_picture_width"`
	ProfilePictureHeight *int    `json:"profile_picture_height"`
	About                *string `json:"about"`
}

type Coordinates struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func ConvertListings(listings []listings.ListingDetails) []Listing {
	converted := make([]Listing, len(listings))
	for i, listing := range listings {
		converted[i] = ConvertListing(listing)
	}

	return converted
}

func ConvertListing(listing listings.ListingDetails) Listing {
	var coordinates *Coordinates
	if listing.Coordinates != nil {
		coordinates = &Coordinates{Latitude: listing.Coordinates.Latitude, Longitude: listing.Coordinates.Longitude}
	}
	return Listing{
		ID:                  listing.ID,
		Name:                listing.Name,
		Description:         listing.Description,
		Price:               listing.Price,
		Location:            listing.Location,
		Coordinates:         coordinates,
		PlaceID:             listing.PlaceID,
		City:                listing.City,
		Region:              listing.Region,
		Country:             listing.Country,
		PostalCode:          listing.PostalCode,
		ShortDescription:    listing.ShortDescription,
		Cancellation:        listing.Cancellation,
		DurationMinutes:     listing.DurationMinutes,
		MaxGuests:           listing.MaxGuests,
		Highlights:          listing.Highlights,
		Includes:            listing.Includes,
		NotIncluded:         listing.NotIncluded,
		Status:              listing.Status,
		AvailabilityType:    listing.AvailabilityType,
		AvailabilityDisplay: listing.AvailabilityDisplay,

		Host: ConvertHost(listing.Host),

		Images: ConvertImages(listing.Images),

		Categories: ConvertCategories(listing.Categories),

		ItinerarySteps: listing.ItinerarySteps,
	}
}

func ConvertHost(user *models.User) Host {
	// TODO: prevent email when email is not verified
	return Host{
		ID:                   user.ID,
		FirstName:            user.FirstName,
		LastName:             user.LastName,
		Email:                user.Email,
		ProfilePictureURL:    user.ProfilePictureURL,
		ProfilePictureWidth:  user.ProfilePictureWidth,
		ProfilePictureHeight: user.ProfilePictureHeight,
		About:                user.About,
	}
}

func ConvertImages(images []models.ListingImage) []Image {
	converted := make([]Image, len(images))
	for i, image := range images {
		converted[i] = Image{
			ID:     image.ID,
			URL:    image_lib.GetGcsImageUrl(image.StorageID),
			Width:  image.Width,
			Height: image.Height,
		}
	}

	return converted
}

func ConvertCategories(categories []models.ListingCategory) []models.ListingCategoryType {
	converted := []models.ListingCategoryType{}
	for _, category := range categories {
		if slices.Contains(models.SPECIAL_CATEGORIES, category.Category) {
			continue
		}

		converted = append(converted, category.Category)
	}

	return converted
}
