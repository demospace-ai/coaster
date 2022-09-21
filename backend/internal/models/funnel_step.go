package models

// TODO: marshal to externally-friendly json
type FunnelStep struct {
	AnalysisID int64  `json:"analysis_id"`
	StepName   string `json:"step_name"`

	BaseModel
}
