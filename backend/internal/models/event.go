package models

// TODO: marshal to externally-friendly json
type Event struct {
	AnalysisID int64  `json:"analysis_id"`
	Name       string `json:"name"`

	BaseModel
}
