package query

import "errors"

type Schema []ColumnSchema

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Row []Value
type Value interface{}

type QueryResult struct {
	Success      bool   `json:"success"`
	ErrorMessage string `json:"error_message"`
	Schema       Schema `json:"schema"`
	Data         []Row  `json:"data"`
}

var Done = errors.New("no more items in fabra iterator")

type RowIterator interface {
	Next() (Row, error)
}
