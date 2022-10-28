package query

import (
	"fabra/internal/models"
	"fabra/internal/views"
)

func (qs QueryServiceImpl) GetTableSchema(dataConnection *models.DataConnection, datasetName string, tableName string) (views.Schema, error) {

	queryString := "select * from " + datasetName + ".INFORMATION_SCHEMA.COLUMNS where table_name = '" + tableName + "'"

	_, results, err := qs.runQuery(dataConnection, queryString)
	if err != nil {
		return nil, err
	}

	schema := views.Schema{}
	for _, row := range results {
		if row[0] == nil {
			continue
		}

		schema = append(schema, views.ColumnSchema{Name: row[3].(string), Type: row[6].(string)})
	}

	return schema, nil
}
