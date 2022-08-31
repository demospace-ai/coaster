package models

import "fabra/internal/database"

type DataConnectionType string

const (
	DataConnectionTypeSnowflake DataConnectionType = "snowflake"
	DataConnectionTypeBigQuery  DataConnectionType = "bigquery"
)

type DataConnection struct {
	OrganizationID int64
	DisplayName    string `json:"display_name"`
	ConnectionType DataConnectionType
	Username       database.NullString
	Password       database.NullString
	Credentials    database.NullString
	WarehouseName  database.NullString
	DatabaseName   database.NullString
	Role           database.NullString
	Account        database.NullString

	BaseModel
}
