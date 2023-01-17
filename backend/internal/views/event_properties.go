package views

import "github.com/fabra-io/go-sdk/fabra"

type PropertyGroup struct {
	Name       string               `json:"name"`
	Properties []fabra.ColumnSchema `json:"properties"`
}
