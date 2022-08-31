package models

import "fabra/internal/database"

type DataConnectionType string

const (
	DataConnectionTypeSnowflake DataConnectionType = "snowflake"
	DataConnectionTypeBigQuery  DataConnectionType = "bigquery"
)

type BigQueryCredentials struct {
	Type                    string `json:"type"`
	ProjectID               string `json:"project_id"`
	PrivateKeyID            string `json:"private_key_id"`
	PrivateKey              string `json:"private_key"`
	ClientEmail             string `json:"client_email"`
	ClientID                string `json:"client_id"`
	AuthURI                 string `json:"auth_uri"`
	TokenURI                string `json:"token_uri"`
	AuthProviderX509CertURL string `json:"auth_provider_x509_cert_url"`
	ClientX509CertUrl       string `json:"client_x509_cert_url"`
}

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
