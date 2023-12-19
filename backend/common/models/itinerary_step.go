package models

type ItineraryStep struct {
	ListingID   int64  `json:"-"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StepLabel   string `json:"step_label"`
	StepOrder   int64  `json:"step_order"`

	BaseModel
}
