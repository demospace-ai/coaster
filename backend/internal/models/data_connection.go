package models

import "fabra/internal/database"

type ConnectionType string

const (
	ConnectionTypeSnowflake ConnectionType = "snowflake"
	ConnectionTypeBigQuery  ConnectionType = "bigquery"
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

type Connection struct {
	OrganizationID int64
	ConnectionType ConnectionType      `json:"connection_type"`
	Username       database.NullString `json:"-"`
	Password       database.NullString `json:"-"`
	Credentials    database.NullString `json:"-"`
	WarehouseName  database.NullString
	DatabaseName   database.NullString
	Role           database.NullString
	Host           database.NullString

	BaseModel
}
