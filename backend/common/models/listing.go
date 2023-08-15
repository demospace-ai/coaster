package models

import (
	"github.com/lib/pq"
	"go.fabra.io/server/common/geo"
)

type ListingCategory string

const (
	CategorySurfing    ListingCategory = "surfing"
	CategorySkiing     ListingCategory = "skiing"
	CategoryFishing    ListingCategory = "fishing"
	CategoryHiking     ListingCategory = "hiking"
	CategoryCamping    ListingCategory = "camping"
	CategoryCycling    ListingCategory = "cycling"
	CategoryBoating    ListingCategory = "boating"
	CategoryClimbing   ListingCategory = "climbing"
	CategoryDiving     ListingCategory = "diving"
	CategorySnorkeling ListingCategory = "snorkeling"
	CategoryHunting    ListingCategory = "hunting"
)

type ListingStatus string

const (
	ListingStatusPublished   ListingStatus = "published"
	ListingStatusDraft       ListingStatus = "draft"
	ListingStatusUnderReview ListingStatus = "review"
)

type ListingCancellation string

const (
	ListingCancellationFlexible ListingCancellation = "flexible"
	ListingCancellationModerate ListingCancellation = "moderate"
	ListingCancellationStrict   ListingCancellation = "strict"
)

type Listing struct {
	UserID           int64               `json:"user_id"`
	Name             *string             `json:"name"`
	Description      *string             `json:"description"`
	Category         *ListingCategory    `json:"category"`
	Price            *int64              `json:"price"`
	Location         *string             `json:"location"`
	Coordinates      *geo.Point          `json:"coordinates"`
	Status           ListingStatus       `json:"status"`
	Featured         bool                `json:"featured"`
	ShortDescription *string             `json:"short_description"`
	Cancellation     ListingCancellation `json:"cancellation"`
	DurationHours    *int64              `json:"duration_hours"`
	MaxGuests        *int64              `json:"max_guests"`
	Highlights       pq.StringArray      `json:"highlights" gorm:"type:varchar(128)[]"`
	Includes         pq.StringArray      `json:"includes" gorm:"type:varchar(128)[]"`

	BaseModel
}

type ListingImage struct {
	ListingID int64  `json:"listing_id"`
	StorageID string `json:"storage_id"`
	Rank      int    `json:"rank"` // TODO: use lexorank for this

	BaseModel
}
