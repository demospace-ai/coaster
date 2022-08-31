package models

import "fabra/internal/database"

type DataConnectionType string

const (
	DataConnectionTypeSnowflake DataConnectionType = "snowflake"
	DataConnectionTypeBigQuery  DataConnectionType = "bigquery"
)

type DataConnection struct {
	DisplayName    string `json:"display_name"`
	OrganizationID int64
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
