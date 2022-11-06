package query

import (
	"fabra/internal/analyses"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"text/template"
)

var trendQueryTemplate *template.Template

func init() {
	trendQueryTemplate = template.Must(template.New("trendQuery").Parse(`
		{{ if .customTableQuery }}
			{{.customTableQuery}},
		{{ end }}
		SELECT count(distinct {{.sourceTable}}.{{.userIdentifierColumn}}), event, DATE({{.sourceTable}}.{{.timestampColumn}}) from {{.sourceTable}}
		WHERE {{.sourceTable}}.{{.eventTypeColumn}} = "{{.eventName}}"
		{{range $filterClause := .filterClauses}}
			AND {{$filterClause}}
		{{end}}
	`))
}

func (qs QueryServiceImpl) RunTrendQuery(analysis *models.Analysis) (*views.QueryResult, error) {
	if !analysis.ConnectionID.Valid {
		return nil, errors.NewBadRequest("no data connection configured")
	}

	if !analysis.EventSetID.Valid {
		return nil, errors.NewBadRequest("no event set configured")
	}

	if analysis.AnalysisType != models.AnalysisTypeTrend {
		return nil, errors.NewBadRequest("wrong analysis type")
	}

	dataConnection, err := dataconnections.LoadDataConnectionByID(qs.db, analysis.OrganizationID, analysis.ConnectionID.Int64)
	if err != nil {
		return nil, err
	}

	eventSet, err := eventsets.LoadEventSetByID(qs.db, analysis.OrganizationID, analysis.EventSetID.Int64)
	if err != nil {
		return nil, err
	}

	events, err := analyses.LoadEventsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, err
	}

	filters, err := analyses.LoadEventFiltersByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, err
	}

	queryString, err := createTrendQuery(eventSet, views.ConvertEvents(events, filters))
	if err != nil {
		return nil, err
	}

	return qs.runQuery(dataConnection, queryString[0])
}

func createTrendQuery(eventSet *models.EventSet, events []views.Event) ([]string, error) {
	var customTableQuery string
	var sourceTable string
	if eventSet.CustomJoin.Valid {
		customTableQuery = createCustomTableQuery(eventSet)
		sourceTable = "custom_events"
	} else {
		sourceTable = eventSet.DatasetName.String + "." + eventSet.TableName.String
	}

	// Run separate queries for each event
	var queryArray []string
	for _, event := range events {
		query, err := executeTemplate(trendQueryTemplate, map[string]interface{}{
			"customTableQuery": customTableQuery,
			"sourceTable":      sourceTable,
			"eventName":        event.Name,
			"filterClauses":    event.Filters,
		})

		if err != nil {
			return nil, err
		}

		queryArray = append(queryArray, *query)
	}

	return queryArray, nil
}
