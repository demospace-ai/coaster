package connectors

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/query"
	"go.fabra.io/server/common/views"
	"golang.org/x/time/rate"
)

const MAX_BATCH_SIZE = 1_000

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
	currentBatchSize := 0
	// TODO: allow customizing the rate limit
	limiter := rate.NewLimiter(rate.Every(1*time.Second/100), 100)

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

		currentBatchSize++
		// TODO: allow customizing batch size
		if currentBatchSize == MAX_BATCH_SIZE {
			currentBatchSize = 0
			// TODO: add retry
			limiter.Wait(ctx)
			err := wh.sendData(object.DisplayName, sync.EndCustomerID, outputDataList, destinationConnection.Host)
			if err != nil {
				return err
			}
		}
	}

	if currentBatchSize > 0 {
		err := wh.sendData(object.DisplayName, sync.EndCustomerID, outputDataList, destinationConnection.Host)
		if err != nil {
			return err
		}
	}

	return nil
}

func (wh WebhookImpl) sendData(objectName string, endCustomerId int64, outputDataList []map[string]any, webhookUrl string) error {
	webhookData := WebhookData{
		ObjectName:    objectName,
		EndCustomerId: endCustomerId,
		Data:          outputDataList,
	}
	marshalled, err := json.Marshal(webhookData)
	if err != nil {
		return err
	}

	request, _ := http.NewRequest("POST", webhookUrl, bytes.NewBuffer(marshalled))
	request.Header.Set("Content-Type", "application/json; charset=UTF-8")

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	response.Body.Close()

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
