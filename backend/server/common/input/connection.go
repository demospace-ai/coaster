package input

import "go.fabra.io/server/common/data"

type SnowflakeConfig struct {
	Username      string `json:"username,omitempty"`
	Password      string `json:"password,omitempty"`
	WarehouseName string `json:"warehouse_name,omitempty"`
	DatabaseName  string `json:"database_name,omitempty"`
	Role          string `json:"role,omitempty"`
	Host          string `json:"host,omitempty"`
}

type RedshiftConfig struct {
	Username     string `json:"username,omitempty"`
	Password     string `json:"password,omitempty"`
	DatabaseName string `json:"database_name,omitempty"`
	Endpoint     string `json:"endpoint,omitempty"`
}

type PostgresConfig struct {
	Username     string `json:"username,omitempty"`
	Password     string `json:"password,omitempty"`
	DatabaseName string `json:"database_name,omitempty"`
	Endpoint     string `json:"endpoint,omitempty"`
}

type MySqlConfig struct {
	Username     string `json:"username,omitempty"`
	Password     string `json:"password,omitempty"`
	DatabaseName string `json:"database_name,omitempty"`
	Endpoint     string `json:"endpoint,omitempty"`
}

type SynapseConfig struct {
	Username     string `json:"username,omitempty"`
	Password     string `json:"password,omitempty"`
	DatabaseName string `json:"database_name,omitempty"`
	Endpoint     string `json:"endpoint,omitempty"`
}

type MongoDbConfig struct {
	Username          string  `json:"username,omitempty"`
	Password          string  `json:"password,omitempty"`
	Host              string  `json:"host,omitempty"`
	ConnectionOptions *string `json:"connection_options,omitempty"`
}

type WebhookConfig struct {
	URL     string   `json:"url,omitempty"`
	Headers []Header `json:"headers,omitempty"`
}

type Header struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type BigQueryConfig struct {
	Credentials string `json:"credentials,omitempty"`
	Location    string `json:"location,omitempty"`
}

type DemoDestinationConfig struct {
}

type DemoSourceConfig struct {
}

type ObjectField struct {
	Name        string         `json:"name"`
	Type        data.FieldType `json:"type"`
	Omit        bool           `json:"omit"`
	Optional    bool           `json:"optional"`
	DisplayName *string        `json:"display_name,omitempty"`
	Description *string        `json:"description,omitempty"`
}
