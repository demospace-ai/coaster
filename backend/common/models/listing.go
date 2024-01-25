package models

import (
	"github.com/lib/pq"
	"go.fabra.io/server/common/geo"
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

type AvailabilityDisplay string

const (
	AvailabilityDisplayCalendar AvailabilityDisplay = "calendar"
	AvailabilityDisplayList     AvailabilityDisplay = "list"
)

type Listing struct {
	UserID              int64               `json:"user_id"`
	Name                *string             `json:"name"`
	Description         *string             `json:"description"`
	Price               *int64              `json:"price"`
	Location            *string             `json:"location"`
	Coordinates         *geo.Point          `json:"coordinates"`
	PlaceID             *string             `json:"place_id"`
	City                *string             `json:"city"`
	Region              *string             `json:"region"`
	Country             *string             `json:"country"`
	PostalCode          *string             `json:"postal_code"`
	Status              ListingStatus       `json:"status"`
	ShortDescription    *string             `json:"short_description"`
	Cancellation        ListingCancellation `json:"cancellation"`
	DurationMinutes     *int64              `json:"duration_minutes"`
	MaxGuests           *int64              `json:"max_guests"`
	Highlights          pq.StringArray      `json:"highlights" gorm:"type:varchar(160)[]"`
	Includes            pq.StringArray      `json:"includes" gorm:"type:varchar(160)[]"`
	NotIncluded         pq.StringArray      `json:"not_included" gorm:"type:varchar(160)[]"`
	AvailabilityType    AvailabilityType    `json:"availability_type"`
	AvailabilityDisplay AvailabilityDisplay `json:"availability_display"`

	BaseModel
}

type ListingImage struct {
	ListingID int64  `json:"listing_id"`
	StorageID string `json:"storage_id"`
	Rank      int    `json:"rank"` // TODO: use lexorank for this
	Width     int    `json:"width"`
	Height    int    `json:"height"`

	BaseModel
}

type ListingCategoryType string

const (
	CategorySurfing    ListingCategoryType = "surfing"
	CategorySkiing     ListingCategoryType = "skiing"
	CategoryFishing    ListingCategoryType = "fishing"
	CategoryHiking     ListingCategoryType = "hiking"
	CategoryCamping    ListingCategoryType = "camping"
	CategoryCycling    ListingCategoryType = "cycling"
	CategoryBoating    ListingCategoryType = "boating"
	CategoryClimbing   ListingCategoryType = "climbing"
	CategoryOutdoors   ListingCategoryType = "outdoors"
	CategoryDiving     ListingCategoryType = "diving"
	CategorySnorkeling ListingCategoryType = "snorkeling"
	CategorySafari     ListingCategoryType = "safari"
	CategorySup        ListingCategoryType = "sup"
	CategoryKiteSurf   ListingCategoryType = "kitesurf"
	CategoryWindSurf   ListingCategoryType = "windsurf"
	CategoryWingfoil   ListingCategoryType = "wingfoil"
	CategoryKayaking   ListingCategoryType = "kayaking"
	CategoryBuggying   ListingCategoryType = "buggying"
	CategoryHunting    ListingCategoryType = "hunting"

	CategoryFeatured ListingCategoryType = "featured"
	CategoryPopular  ListingCategoryType = "popular"
)

var SPECIAL_CATEGORIES = []ListingCategoryType{CategoryFeatured, CategoryPopular}

type ListingCategory struct {
	ListingID int64               `json:"listing_id"`
	Category  ListingCategoryType `json:"category"`

	BaseModel
}
