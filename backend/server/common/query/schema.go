package query

import "errors"

type Schema []ColumnSchema

type ColumnSchema struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Row []Value
type Value interface{}

var ErrDone = errors.New("no more items in fabra iterator")

type RowIterator interface {
	Next() (Row, error)
}

type QueryResults struct {
	Data   []Row  `json:"data"`
	Schema Schema `json:"schema"`
}
