package models

import "fabra/internal/database"

type Organization struct {
	Name                    string             `json:"name"`
	EmailDomain             string             `json:"email_domain"`
	DefaultDataConnectionID database.NullInt64 `json:"default_data_connection_id"`
	DefaultEventSetID       database.NullInt64 `json:"default_event_set_id"`

	BaseModel
}
