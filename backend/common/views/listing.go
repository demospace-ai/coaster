package views

import (
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/repositories/listings"
)

type Listing struct {
	ID               int64                      `json:"id"`
	Name             *string                    `json:"name"`
	Description      *string                    `json:"description"`
	Category         *models.ListingCategory    `json:"category"`
	Price            *int64                     `json:"price"`
	Location         *string                    `json:"location"`
	Coordinates      *Coordinates               `json:"coordinates"`
	ShortDescription *string                    `json:"short_description"`
	Cancellation     models.ListingCancellation `json:"cancellation"`
	DurationHours    *int64                     `json:"duration_hours"`
	MaxGuests        *int64                     `json:"max_guests"`
	Highlights       []string                   `json:"highlights"`
	Includes         []string                   `json:"includes"`
	Status           models.ListingStatus       `json:"status"`

	Host Host `json:"host"`

	Images []string `json:"images"`
}

type Host struct {
	ID                int64  `json:"id"`
	FirstName         string `json:"first_name"`
	LastName          string `json:"last_name"`
	ProfilePictureURL string `json:"profile_picture_url"`
	About             string `json:"about"`
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

func ConvertBasicListing(listing models.Listing) Listing {
	var coordinates *Coordinates
	if listing.Coordinates != nil {
		coordinates = &Coordinates{Latitude: listing.Coordinates.Latitude, Longitude: listing.Coordinates.Longitude}
	}
	return Listing{
		ID:               listing.ID,
		Name:             listing.Name,
		Description:      listing.Description,
		Category:         listing.Category,
		Price:            listing.Price,
		Location:         listing.Location,
		Coordinates:      coordinates,
		ShortDescription: listing.ShortDescription,
		Cancellation:     listing.Cancellation,
		DurationHours:    listing.DurationHours,
		MaxGuests:        listing.MaxGuests,
		Highlights:       listing.Highlights,
		Includes:         listing.Includes,
		Status:           listing.Status,
	}
}

func ConvertListing(listing listings.ListingDetails) Listing {
	var coordinates *Coordinates
	if listing.Coordinates != nil {
		coordinates = &Coordinates{Latitude: listing.Coordinates.Latitude, Longitude: listing.Coordinates.Longitude}
	}
	return Listing{
		ID:               listing.ID,
		Name:             listing.Name,
		Description:      listing.Description,
		Category:         listing.Category,
		Price:            listing.Price,
		Location:         listing.Location,
		Coordinates:      coordinates,
		ShortDescription: listing.ShortDescription,
		Cancellation:     listing.Cancellation,
		DurationHours:    listing.DurationHours,
		MaxGuests:        listing.MaxGuests,
		Highlights:       listing.Highlights,
		Includes:         listing.Includes,
		Status:           listing.Status,

		Host: ConvertHost(listing.Host),

		Images: ConvertImages(listing.Images),
	}
}

func ConvertHost(user *models.User) Host {
	return Host{
		ID:                user.ID,
		FirstName:         user.FirstName,
		LastName:          user.LastName,
		ProfilePictureURL: user.ProfilePictureURL,
		About:             user.About,
	}
}

func ConvertImages(images []models.ListingImage) []string {
	converted := make([]string, len(images))
	for i, image := range images {
		converted[i] = image.StorageID
	}

	return converted
}
