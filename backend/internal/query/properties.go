package query

import (
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/views"
)

func (qs QueryServiceImpl) GetProperties(dataConnection *models.DataConnection, eventSet *models.EventSet) ([]views.PropertyGroup, error) {
	queryString, err := createPropertiesQuery(eventSet)
	if err != nil {
		return nil, err
	}

	queryResult, err := qs.runQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	eventProperties := views.PropertyGroup{
		Name:       "Event",
		Properties: queryResult.Schema,
	}

	// TODO: fetch custom properties as well
	return []views.PropertyGroup{eventProperties}, nil
}

func createPropertiesQuery(eventSet *models.EventSet) (string, error) {
	if eventSet.CustomJoin.Valid {
		return createCustomTableQuery(eventSet) + "SELECT * FROM custom_events LIMIT 1", nil
	}

	if eventSet.DatasetName.Valid && eventSet.TableName.Valid {
		return "SELECT * FROM " + eventSet.DatasetName.String + "." + eventSet.TableName.String + " LIMIT 1", nil
	}

	return "", errors.Newf("bad event set: %v", eventSet)
}

func (qs QueryServiceImpl) GetPropertyValues(dataConnection *models.DataConnection, eventSet *models.EventSet, propertyName string) ([]views.Value, error) {
	queryString, err := createGetPropertyValuesQuery(eventSet, propertyName)
	if err != nil {
		return nil, err
	}

	queryResult, err := qs.runQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	events := []views.Value{}
	for _, row := range queryResult.Data {
		events = append(events, row[0])
	}

	return events, nil
}

// This gets 50 values, in the future we might make this configurable
func createGetPropertyValuesQuery(eventSet *models.EventSet, propertyValue string) (string, error) {
	if eventSet.CustomJoin.Valid {
		return createCustomTableQuery(eventSet) + "SELECT DISTINCT " + propertyValue + " FROM custom_events LIMIT 50", nil
	}

	if eventSet.DatasetName.Valid && eventSet.TableName.Valid {
		return "SELECT DISTINCT " + propertyValue + " FROM " + eventSet.DatasetName.String + "." + eventSet.TableName.String + " LIMIT 50", nil
	}

	return "", errors.Newf("bad event set: %v", eventSet)
}
