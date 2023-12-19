package input

type ItineraryStep struct {
	ID          *int64  `json:"id"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	StepLabel   *string `json:"step_label"`
}
