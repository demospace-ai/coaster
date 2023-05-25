package connectors

import (
	"context"
	"encoding/json"
	"time"

	"go.fabra.io/server/common/data"
	"go.fabra.io/server/common/errors"
	demoDestinations "go.fabra.io/server/common/repositories/demo_destinations"
	"go.fabra.io/server/common/views"
	"golang.org/x/time/rate"
	"gorm.io/gorm"
)

const MAX_DEMO_DESTINATION_BATCH_SIZE = 1_000

type DemoDestinationData struct {
	ObjectName     string           `json:"object_name"`
	EndCustomerID  string           `json:"end_customer_id"`
	FabraTimestamp int64            `json:"fabra_timestamp"`
	Data           []map[string]any `json:"data"`
}

type DemoDestinationImpl struct {
	db *gorm.DB
}

func NewDemoDestinationConnector(db *gorm.DB) Connector {
	return DemoDestinationImpl{
		db,
	}
}

func (wh DemoDestinationImpl) Read(
	ctx context.Context,
	sourceConnection views.FullConnection,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC chan<- []data.Row,
	readOutputC chan<- ReadOutput,
	errC chan<- error,
) {
	errC <- errors.New("demodestination source not supported")
}

func (dd DemoDestinationImpl) Write(
	ctx context.Context,
	destinationConnection views.FullConnection,
	destinationOptions DestinationOptions,
	object views.Object,
	sync views.Sync,
	fieldMappings []views.FieldMapping,
	rowsC <-chan []data.Row,
	writeOutputC chan<- WriteOutput,
	errC chan<- error,
) {
	limiter := rate.NewLimiter(REFILL_RATE, MAX_BURST)

	orderedObjectFields := dd.createOrderedObjectFields(object.ObjectFields, fieldMappings)
	outputDataList := []map[string]any{}
	destinationID := object.DestinationID
	// Fetch the demo destination ID? Should be unique on the `destinationID`, whose connection type.
	// Okay, so there should be a repo function called `fetchDemoDestinationIDByDestinationID`, that returns nil if there's no
	// demoDestination. If there is a demoDestination, it returns the ID.
	// Later, when we're writing the data, we'll be writing it to the demoDestinationID.

	rowsWritten := 0
	for {
		currentBatchSize := 0
		rows, more := <-rowsC
		if !more {
			break
		}

		rowsWritten += len(rows)
		for _, row := range rows {
			outputData := map[string]any{}
			for i, value := range row {
				fieldMapping := fieldMappings[i]
				destFieldName := orderedObjectFields[i].Name
				// add raw values to the json object even if they're nil
				if fieldMapping.IsJsonField {
					existing, ok := outputData[destFieldName]
					if !ok {
						existing = make(map[string]any)
						outputData[destFieldName] = existing
					}

					existing.(map[string]any)[fieldMapping.SourceFieldName] = value
				} else {
					if value != nil {
						outputData[destFieldName] = value
					}
				}
			}
			outputDataList = append(outputDataList, outputData)

			currentBatchSize++
			// TODO: allow customizing batch size
			if currentBatchSize == MAX_DEMO_DESTINATION_BATCH_SIZE {
				// TODO: add retry
				limiter.Wait(ctx)
				err := dd.sendData(object.DisplayName, sync.EndCustomerID, outputDataList)
				if err != nil {
					errC <- err
					return
				}

				currentBatchSize = 0
				outputDataList = nil
			}
		}

		if currentBatchSize > 0 {
			err := dd.sendData(object.DisplayName, sync.EndCustomerID, outputDataList)
			if err != nil {
				errC <- err
				return
			}
		}
	}

	writeOutputC <- WriteOutput{
		RowsWritten: rowsWritten,
	}

	close(errC)
}

func (dd DemoDestinationImpl) sendData(objectName string, endCustomerID string, outputDataList []map[string]any) error {
	demoDestinationData := DemoDestinationData{
		ObjectName:     objectName,
		EndCustomerID:  endCustomerID,
		FabraTimestamp: time.Now().Unix(),
		Data:           outputDataList,
	}
	marshalled, err := json.Marshal(demoDestinationData)
	if err != nil {
		return errors.Wrap(err, "(connectors.DemoDestinationImpl.sendData)")
	}

	demoDestinations.WriteNewSyncToDemoDestination(dd.db, string(marshalled))

}

// func (dd DemoDestinationImpl) sendData(objectName string, endCustomerID string, endCustomerApiKey *string, outputDataList []map[string]any, demodestinationUrl string, decryptedSigningKey string) error {
// 	demodestinationData := DemoDestinationData{
// 		ObjectName:        objectName,
// 		EndCustomerID:     endCustomerID,
// 		EndCustomerApiKey: endCustomerApiKey,
// 		FabraTimestamp:    time.Now().Unix(),
// 		Data:              outputDataList,
// 	}
// 	marshalled, err := json.Marshal(demodestinationData)
// 	if err != nil {
// 		return errors.Wrap(err, "(connectors.DemoDestinationImpl.sendData)")
// 	}

// 	request, _ := http.NewRequest("POST", demodestinationUrl, bytes.NewBuffer(marshalled))
// 	request.Header.Set("Content-Type", "application/json; charset=UTF-8")

// 	client := &http.Client{}
// 	response, err := client.Do(request)
// 	if err != nil {
// 		return errors.Wrap(err, "(connectors.DemoDestinationImpl.sendData)")
// 	}
// 	response.Body.Close()

// 	return nil
// }

func (dd DemoDestinationImpl) createOrderedObjectFields(objectFields []views.ObjectField, fieldMappings []views.FieldMapping) []views.ObjectField {
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
