package query

import (
	"fabra/internal/errors"
	"fabra/internal/models"
)

func (qs QueryServiceImpl) GetEvents(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]string, error) {
	queryString, err := createGetEventsQuery(eventSet)
	if err != nil {
		return nil, err
	}

	queryResult, err := qs.runQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	events := []string{}
	for _, row := range queryResult.Data {
		if row[0] == nil {
			continue
		}

		events = append(events, row[0].(string))
	}

	return events, nil
}

func createGetEventsQuery(eventSet *models.EventSet) (string, error) {
	if eventSet.CustomJoin.Valid {
		return createCustomTableQuery(eventSet) + "SELECT DISTINCT " + eventSet.EventTypeColumn + " FROM custom_events", nil
	}

	if eventSet.DatasetName.Valid && eventSet.TableName.Valid {
		return "SELECT DISTINCT " + eventSet.EventTypeColumn + " FROM " + eventSet.DatasetName.String + "." + eventSet.TableName.String, nil
	}

	return "", errors.Newf("bad event set: %v", eventSet)
}
