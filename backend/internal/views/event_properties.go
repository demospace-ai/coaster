package views

type PropertyGroup struct {
	Name       string         `json:"name"`
	Properties []ColumnSchema `json:"properties"`
}
