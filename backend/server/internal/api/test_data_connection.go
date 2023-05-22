package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"cloud.google.com/go/bigquery"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/snowflakedb/gosnowflake"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type TestDataConnectionRequest struct {
	DisplayName     string                 `json:"display_name"`
	ConnectionType  models.ConnectionType  `json:"connection_type"`
	BigQueryConfig  *input.BigQueryConfig  `json:"bigquery_config,omitempty"`
	SnowflakeConfig *input.SnowflakeConfig `json:"snowflake_config,omitempty"`
	RedshiftConfig  *input.RedshiftConfig  `json:"redshift_config,omitempty"`
	SynapseConfig   *input.SynapseConfig   `json:"synapse_config,omitempty"`
	PostgresConfig  *input.PostgresConfig  `json:"postgres_config,omitempty"`
	MongoDbConfig   *input.MongoDbConfig   `json:"mongodb_config,omitempty"`
}

func (s ApiService) TestDataConnection(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	decoder := json.NewDecoder(r.Body)
	var testDataConnectionRequest TestDataConnectionRequest
	err := decoder.Decode(&testDataConnectionRequest)
	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}

	err = validateTestDataConnectionRequest(testDataConnectionRequest)
	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}

	switch testDataConnectionRequest.ConnectionType {
	case models.ConnectionTypeBigQuery:
		err = testBigQueryConnection(*testDataConnectionRequest.BigQueryConfig)
	case models.ConnectionTypeSnowflake:
		err = testSnowflakeConnection(*testDataConnectionRequest.SnowflakeConfig)
	case models.ConnectionTypeMongoDb:
		err = testMongoDbConnection(*testDataConnectionRequest.MongoDbConfig)
	case models.ConnectionTypeRedshift:
		err = testRedshiftConnection(*testDataConnectionRequest.RedshiftConfig)
	case models.ConnectionTypeSynapse:
		err = testSynapseConnection(*testDataConnectionRequest.SynapseConfig)
	case models.ConnectionTypePostgres:
		err = testPostgresConnection(*testDataConnectionRequest.PostgresConfig)
	default:
		err = errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", testDataConnectionRequest.ConnectionType))
	}

	if err != nil {
		return errors.NewCustomerVisibleError(err)
	}

	return nil
}

func testBigQueryConnection(bigqueryConfig input.BigQueryConfig) error {
	var bigQueryCredentials models.BigQueryCredentials
	err := json.Unmarshal([]byte(bigqueryConfig.Credentials), &bigQueryCredentials)
	if err != nil {
		return err
	}

	credentialOption := option.WithCredentialsJSON([]byte(bigqueryConfig.Credentials))

	ctx := context.Background()
	client, err := bigquery.NewClient(ctx, bigQueryCredentials.ProjectID, credentialOption)
	if err != nil {
		return err
	}
	defer client.Close()

	it := client.Datasets(ctx)
	_, err = it.Next()

	if err != nil && err != iterator.Done {
		return err
	}

	return nil
}

func testSnowflakeConnection(snowflakeConfig input.SnowflakeConfig) error {
	account := strings.Split(snowflakeConfig.Host, ".")[0] // TODO: remove the https/http
	config := gosnowflake.Config{
		Account:       account,
		User:          snowflakeConfig.Username,
		Password:      snowflakeConfig.Password,
		Warehouse:     snowflakeConfig.WarehouseName,
		Database:      snowflakeConfig.DatabaseName,
		Role:          snowflakeConfig.Role,
		Host:          snowflakeConfig.Host,
		LoginTimeout:  3 * time.Second,
		ClientTimeout: 3 * time.Second,
	}

	dsn, err := gosnowflake.DSN(&config)
	if err != nil {
		return err
	}

	db, err := sql.Open("snowflake", dsn)
	if err != nil {
		return err
	}
	defer db.Close()

	rows, err := db.Query("SELECT 1")
	if err != nil {
		return err
	}
	defer rows.Close()

	var v int
	for rows.Next() {
		err := rows.Scan(&v)
		if err != nil {
			return err
		}
		if v != 1 {
			return err
		}
	}
	if rows.Err() != nil {
		return err
	}

	return nil
}

func testRedshiftConnection(redshiftConfig input.RedshiftConfig) error {
	params := url.Values{}
	params.Add("sslmode", "require")
	params.Add("connect_timeout", "5")

	dsn := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(redshiftConfig.Username, redshiftConfig.Password),
		Host:     redshiftConfig.Endpoint,
		Path:     redshiftConfig.DatabaseName,
		RawQuery: params.Encode(),
	}

	db, err := sql.Open("postgres", dsn.String())
	if err != nil {
		return err
	}
	defer db.Close()

	rows, err := db.Query("SELECT 1")
	if err != nil {
		return err
	}
	defer rows.Close()

	var v int
	for rows.Next() {
		err := rows.Scan(&v)
		if err != nil {
			return err
		}
		if v != 1 {
			return err
		}
	}
	if rows.Err() != nil {
		return err
	}

	return nil
}

func testSynapseConnection(synapseConfig input.SynapseConfig) error {
	params := url.Values{}
	params.Add("database", synapseConfig.DatabaseName)
	params.Add("sslmode", "encrypt")
	params.Add("TrustServerCertificate", "true")
	params.Add("dial timeout", "3")

	dsn := url.URL{
		Scheme:   "sqlserver",
		User:     url.UserPassword(synapseConfig.Username, synapseConfig.Password),
		Host:     synapseConfig.Endpoint,
		RawQuery: params.Encode(),
	}

	db, err := sql.Open("sqlserver", dsn.String())
	if err != nil {
		return err
	}
	defer db.Close()

	rows, err := db.Query("SELECT 1")
	if err != nil {
		return err
	}
	defer rows.Close()

	var v int
	for rows.Next() {
		err := rows.Scan(&v)
		if err != nil {
			return err
		}
		if v != 1 {
			return err
		}
	}
	if rows.Err() != nil {
		return err
	}

	return nil
}

func testMongoDbConnection(mongodbConfig input.MongoDbConfig) error {
	connectionOptions := ""
	if mongodbConfig.ConnectionOptions != nil {
		connectionOptions = *mongodbConfig.ConnectionOptions
	}

	connectionString := fmt.Sprintf(
		"mongodb+srv://%s:%s@%s/?%s",
		mongodbConfig.Username,
		mongodbConfig.Password,
		mongodbConfig.Host,
		connectionOptions,
	)
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		SetServerAPIOptions(serverAPIOptions).
		SetConnectTimeout(3 * time.Second).
		ApplyURI(connectionString) // Apply URI last since this contains connection options from the user
	_, err := mongo.Connect(context.TODO(), clientOptions)
	return err
}

func testPostgresConnection(postgresConfig input.PostgresConfig) error {
	params := url.Values{}
	params.Add("sslmode", "require")
	params.Add("connect_timeout", "5")

	dsn := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(postgresConfig.Username, postgresConfig.Password),
		Host:     postgresConfig.Endpoint,
		Path:     postgresConfig.DatabaseName,
		RawQuery: params.Encode(),
	}

	db, err := sql.Open("postgres", dsn.String())
	if err != nil {
		return err
	}
	defer db.Close()

	rows, err := db.Query("SELECT 1")
	if err != nil {
		return err
	}
	defer rows.Close()

	var v int
	for rows.Next() {
		err := rows.Scan(&v)
		if err != nil {
			return err
		}
		if v != 1 {
			return err
		}
	}
	if rows.Err() != nil {
		return err
	}

	return nil
}

func validateTestDataConnectionRequest(request TestDataConnectionRequest) error {
	switch request.ConnectionType {
	case models.ConnectionTypeBigQuery:
		return validateTestBigQueryConnection(request)
	case models.ConnectionTypeSnowflake:
		return validateTestSnowflakeConnection(request)
	case models.ConnectionTypeRedshift:
		return validateTestRedshiftConnection(request)
	case models.ConnectionTypeMongoDb:
		return validateTestMongoConnection(request)
	case models.ConnectionTypeSynapse:
		return validateTestSynapseConnection(request)
	case models.ConnectionTypePostgres:
		return validateTestPostgresConnection(request)
	default:
		return errors.NewBadRequest(fmt.Sprintf("unknown connection type: %s", request.ConnectionType))
	}
}

func validateTestBigQueryConnection(request TestDataConnectionRequest) error {
	if request.BigQueryConfig == nil {
		return errors.NewBadRequest("missing BigQuery configuration")
	}

	var bigQueryCredentials models.BigQueryCredentials
	err := json.Unmarshal([]byte(request.BigQueryConfig.Credentials), &bigQueryCredentials)
	if err != nil {
		return err
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateTestSnowflakeConnection(request TestDataConnectionRequest) error {
	if request.SnowflakeConfig == nil {
		return errors.NewBadRequest("missing Snowflake configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateTestRedshiftConnection(request TestDataConnectionRequest) error {
	if request.RedshiftConfig == nil {
		return errors.NewBadRequest("missing Redshift configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateTestMongoConnection(request TestDataConnectionRequest) error {
	if request.MongoDbConfig == nil {
		return errors.NewBadRequest("missing MongoDB configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateTestSynapseConnection(request TestDataConnectionRequest) error {
	if request.SynapseConfig == nil {
		return errors.NewBadRequest("missing Synapse configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}

func validateTestPostgresConnection(request TestDataConnectionRequest) error {
	if request.PostgresConfig == nil {
		return errors.NewBadRequest("missing Postgres configuration")
	}

	// TODO: validate the fields all exist in the credentials object

	return nil
}
