package views

type Schema []ColumnSchema

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Row []Value
type Value interface{}
