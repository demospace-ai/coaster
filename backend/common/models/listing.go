package models

import (
	"github.com/lib/pq"
	"go.fabra.io/server/common/geo"
)

type ListingCategory string

const (
	CategorySurfing      ListingCategory = "surfing"
	CategorySkiing       ListingCategory = "skiing"
	CategoryFishing      ListingCategory = "fishing"
	CategoryHiking       ListingCategory = "hiking"
	CategoryCamping      ListingCategory = "camping"
	CategoryCycling      ListingCategory = "cycling"
	CategoryBoating      ListingCategory = "boating"
	CategoryClimbing     ListingCategory = "climbing"
	CategoryOutdoors     ListingCategory = "outdoors"
	CategoryDiving       ListingCategory = "diving"
	CategorySnorkeling   ListingCategory = "snorkeling"
	CategorySafari       ListingCategory = "safari"
	CategorySup          ListingCategory = "paddleboarding"
	CategoryKiteBoarding ListingCategory = "kiteboarding"
	CategoryWindSurfing  ListingCategory = "windsurfing"
	CategoryKayaking     ListingCategory = "kayaking"
	CategoryBuggying     ListingCategory = "buggying"
	CategoryEfoiling     ListingCategory = "efoiling"
	CategoryKiteFoiling  ListingCategory = "kitefoiling"
	CategoryHunting      ListingCategory = "hunting"
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

type AvailabilityType string

const (
	AvailabilityTypeDate     AvailabilityType = "date"
	AvailabilityTypeDateTime AvailabilityType = "datetime"
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
	DurationMinutes  *int64              `json:"duration_minutes"`
	MaxGuests        *int64              `json:"max_guests"`
	Highlights       pq.StringArray      `json:"highlights" gorm:"type:varchar(160)[]"`
	Includes         pq.StringArray      `json:"includes" gorm:"type:varchar(160)[]"`
	NotIncluded      pq.StringArray      `json:"not_included" gorm:"type:varchar(160)[]"`
	AvailabilityType AvailabilityType    `json:"availability_type"`

	BaseModel
}

type ListingImage struct {
	ListingID int64  `json:"listing_id"`
	StorageID string `json:"storage_id"`
	Rank      int    `json:"rank"` // TODO: use lexorank for this

	BaseModel
}
