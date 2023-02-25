package views

import "go.fabra.io/server/common/query"

type QueryResult struct {
	Schema query.Schema `json:"schema"`
	Data   []query.Row  `json:"data"`
}
