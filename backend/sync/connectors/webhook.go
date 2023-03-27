package connectors

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/views"
)

type WebhookData struct {
	ObjectName    string           `json:"object_name"`
	EndCustomerId int64            `json:"end_customer_id"`
	Data          []map[string]any `json:"data"`
}

type WebhookImpl struct {
	queryService query.QueryService
}

func NewWebhookConnector(queryService query.QueryService) Connector {
	return WebhookImpl{
		queryService: queryService,
	}
}

func (wh WebhookImpl) Read(ctx context.Context, sourceConnection views.FullConnection, sync views.Sync, fieldMappings []views.FieldMapping) ([]data.Row, *string, error) {
	return nil, nil, errors.New("webhook source not supported")
}

func (wh WebhookImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rows []data.Row,
) error {
	// TODO: batch insert 10,000 rows at a time
	orderedObjectFields := wh.createOrderedObjectFields(object.ObjectFields, fieldMappings)
	outputDataList := []map[string]any{}
	for _, row := range rows {
		outputData := map[string]any{}
		for i, value := range row {
			destFieldName := orderedObjectFields[i].Name
			if value != nil {
				outputData[destFieldName] = value
			}
		}
		outputDataList = append(outputDataList, outputData)
	}

	webhookData := WebhookData{
		ObjectName:    object.DisplayName,
		EndCustomerId: sync.EndCustomerID,
		Data:          outputDataList,
	}
	marshalled, err := json.Marshal(webhookData)
	if err != nil {
		return err
	}

	request, _ := http.NewRequest("POST", destinationConnection.Host, bytes.NewBuffer(marshalled))
	request.Header.Set("Content-Type", "application/json; charset=UTF-8")

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	return nil
}

func (wh WebhookImpl) createOrderedObjectFields(objectFields []views.ObjectField, fieldMappings []views.FieldMapping) []views.ObjectField {
	objectFieldIdToObjectField := make(map[int64]views.ObjectField)
	for _, objectField := range objectFields {
		objectFieldIdToObjectField[objectField.ID] = objectField
	}

	var orderedObjectFields []views.ObjectField
	for _, fieldMapping := range fieldMappings {
		orderedObjectFields = append(orderedObjectFields, objectFieldIdToObjectField[fieldMapping.DestinationFieldId])
	}

	return orderedObjectFields
}
