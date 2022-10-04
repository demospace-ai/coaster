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

	schema, _, err := qs.RunQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	propertyNames := []string{}
	for _, column := range schema {
		propertyNames = append(propertyNames, column.Name)
	}
	eventProperties := views.PropertyGroup{
		Name:       "Event",
		Properties: propertyNames,
	}

	// TODO: fetch custom properties as well
	return []views.PropertyGroup{eventProperties}, nil
}

func createPropertiesQuery(eventSet *models.EventSet) (string, error) {
	if eventSet.CustomJoin.Valid {
		return createCustomTableQuery(eventSet) + "SELECT * FROM custom_events LIMIT 0", nil
	}

	if eventSet.DatasetName.Valid && eventSet.TableName.Valid {
		return "SELECT * FROM " + eventSet.DatasetName.String + "." + eventSet.TableName.String + " LIMIT 0", nil
	}

	return "", errors.Newf("bad event set: %v", eventSet)
}
