package input

import (
	"encoding/json"

	"go.fabra.io/server/common/data"
)

type PartialUpdateObjectField struct {
	Name           *string         `json:"name"`
	Type           *data.FieldType `json:"type"`
	Omit           *bool           `json:"omit"`
	Optional       *bool           `json:"optional"`
	DisplayNameRaw json.RawMessage `json:"display_name"`
	DescriptionRaw json.RawMessage `json:"description"`
}
