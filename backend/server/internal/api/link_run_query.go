package api

import (
	"context"
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/auth"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/models"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/repositories/connections"
	"go.fabra.io/server/common/repositories/sources"
	"go.fabra.io/server/common/views"
	"go.mongodb.org/mongo-driver/bson"
)

type LinkGetPreviewRequest struct {
	SourceID  int64  `json:"source_id"`
	Namespace string `json:"namespace"`
	TableName string `json:"table_name"`
}

func (s ApiService) LinkGetPreview(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {
	if auth.Organization == nil {
		return errors.NewBadRequest("must setup organization first")
	}

	if auth.LinkToken == nil {
		return errors.NewBadRequest("must send link token")
	}

	decoder := json.NewDecoder(r.Body)
	var getPreviewRequest LinkGetPreviewRequest
	err := decoder.Decode(&getPreviewRequest)
	if err != nil {
		return err
	}

	// Needed to ensure end customer ID encoded by the link token owns the source/connection
	source, err := sources.LoadSourceByID(s.db, auth.Organization.ID, auth.LinkToken.EndCustomerID, getPreviewRequest.SourceID)
	if err != nil {
		return err
	}

	connection, err := connections.LoadConnectionByID(s.db, auth.Organization.ID, source.ConnectionID)
	if err != nil {
		return nil
	}

	schema, err := s.queryService.GetTableSchema(context.TODO(), connection, getPreviewRequest.Namespace, getPreviewRequest.TableName)
	if err != nil {
		return nil
	}

	query, err := getPreviewQuery(connection.ConnectionType, getPreviewRequest.Namespace, getPreviewRequest.TableName)
	if err != nil {
		return nil
	}

	data, err := s.queryService.RunQuery(context.TODO(), connection, *query)
	if err != nil {
		return nil
	}

	return json.NewEncoder(w).Encode(views.QueryResult{
		Schema: schema,
		Data:   data,
	})
}

func getPreviewQuery(connectionType models.ConnectionType, namespace string, tableName string) (*string, error) {
	switch connectionType {
	case models.ConnectionTypeMongoDb:
		mongoQuery := query.MongoQuery{
			Database: namespace,
			Query:    bson.D{{Key: "find", Value: tableName}},
		}

		mongoQueryBytes, err := json.Marshal(mongoQuery)
		if err != nil {
			return nil, err
		}

		mongoQueryStr := string(mongoQueryBytes)
		return &mongoQueryStr, nil
	case models.ConnectionTypeBigQuery:
		fallthrough
	case models.ConnectionTypeRedshift:
		fallthrough
	case models.ConnectionTypeSnowflake:
		queryStr := "SELECT * FROM " + namespace + "." + tableName + " LIMIT 100;"
		return &queryStr, nil
	default:
		return nil, errors.New("unexpected connection type")
	}
}
