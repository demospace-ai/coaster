package input

import (
	"go.fabra.io/server/common/geo"
	"go.fabra.io/server/common/models"
)

type Listing struct {
	Name             *string                     `json:"name"`
	Description      *string                     `json:"description"`
	Category         *models.ListingCategory     `json:"category"`
	Price            *int64                      `json:"price"`
	Location         *string                     `json:"location"`
	Coordinates      *geo.Point                  `json:"coordinates"`
	Status           *models.ListingStatus       `json:"status"`
	ShortDescription *string                     `json:"short_description"`
	Cancellation     *models.ListingCancellation `json:"cancellation"`
	DurationMinutes  *int64                      `json:"duration_minutes"`
	MaxGuests        *int64                      `json:"max_guests"`
	Highlights       []string                    `json:"highlights"`
	Includes         []string                    `json:"includes"`
}

type ListingImage struct {
	ID int64 `json:"id"`
}
