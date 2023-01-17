package query

import (
	"fabra/internal/analyses"
	"fabra/internal/database"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"sync"
	"text/template"

	"github.com/fabra-io/go-sdk/fabra"
)

var trendQueryTemplate *template.Template

func init() {
	trendQueryTemplate = template.Must(template.New("trendQuery").Parse(`
		{{ if .customTableQuery }}
			{{.customTableQuery}},
		{{ end }}
		SELECT "{{.eventName}}" as event, {{.distinctClause}} as count, DATE({{.timestampColumn}}) as date {{ if .breakdown }} , {{.breakdown}} {{ end }} from {{.sourceTable}}
		WHERE {{.eventTypeColumn}} = "{{.eventName}}"
		{{range $filterClause := .filterClauses}}
			AND {{$filterClause}}
		{{end}}
		GROUP BY date {{ if .breakdown }} , {{.breakdown}} {{ end }}
		ORDER BY date
	`))
}

func (qs QueryServiceImpl) RunTrendQuery(analysis *models.Analysis) ([]fabra.QueryResult, error) {
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

	queries, err := createTrendQuery(eventSet, views.ConvertEvents(events, filters), analysis.BreakdownPropertyName)
	if err != nil {
		return nil, err
	}

	// these queries take a while so run them synchronously
	var wg sync.WaitGroup
	errs := make(chan error)
	results := make([]fabra.QueryResult, len(queries))
	for i, query := range queries {
		wg.Add(1)
		go func(i int, query string) {
			defer wg.Done()
			result, err := qs.runQuery(dataConnection, query)
			if err != nil {
				errs <- err
			}

			results[i] = *result
		}(i, query)
	}

	wg.Wait()
	close(errs)

	// return the first error
	for err := range errs {
		if err != nil {
			return nil, err
		}
	}

	return results, nil
}

func createTrendQuery(eventSet *models.EventSet, events []views.Event, breakdown database.NullString) ([]string, error) {
	var customTableQuery string
	var sourceTable string
	if eventSet.CustomJoin.Valid {
		customTableQuery = createCustomTableQuery(eventSet)
		sourceTable = "custom_events"
	} else {
		sourceTable = eventSet.DatasetName.String + "." + eventSet.TableName.String
	}

	var breakdownPtr *string
	if breakdown.Valid {
		breakdownPtr = &breakdown.String
	}

	distinctClause := "count(*)" // TODO: "count(distinct " + userIdentifierColumn + ")"

	// Run separate queries for each event
	var queryArray []string
	for _, event := range events {
		var filterClauses []string
		for _, filter := range event.Filters {
			filterClauses = append(filterClauses, toSQL(eventSet.TableName.String, filter))
		}

		query, err := executeTemplate(trendQueryTemplate, map[string]interface{}{
			"distinctClause":       distinctClause,
			"customTableQuery":     customTableQuery,
			"sourceTable":          sourceTable,
			"eventName":            event.Name,
			"eventTypeColumn":      eventSet.EventTypeColumn,
			"userIdentifierColumn": eventSet.UserIdentifierColumn,
			"timestampColumn":      eventSet.TimestampColumn,
			"filterClauses":        filterClauses,
			"breakdown":            breakdownPtr,
		})

		if err != nil {
			return nil, err
		}

		queryArray = append(queryArray, *query)
	}

	return queryArray, nil
}
