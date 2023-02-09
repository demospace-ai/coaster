package input

type SnowflakeConfig struct {
	Username      string `json:"username,omitempty"`
	Password      string `json:"password,omitempty"`
	WarehouseName string `json:"warehouse_name,omitempty"`
	DatabaseName  string `json:"database_name,omitempty"`
	Role          string `json:"role,omitempty"`
	Host          string `json:"host,omitempty"`
}

type BigQueryConfig struct {
	Credentials string `json:"credentials,omitempty"`
}
