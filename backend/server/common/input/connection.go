package input

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
	Port         string `json:"port,omitempty"`
	Host         string `json:"host,omitempty"`
}

type MongoDbConfig struct {
	Username          string `json:"username,omitempty"`
	Password          string `json:"password,omitempty"`
	Host              string `json:"host,omitempty"`
	ConnectionOptions string `json:"connection_options,omitempty"`
}

type BigQueryConfig struct {
	Credentials string `json:"credentials,omitempty"`
	Location    string `json:"location,omitempty"`
}

type ObjectField struct {
	Name string `json:"name"`
	Type string `json:"type"`
}
