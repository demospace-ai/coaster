package query

import (
	"fabra/internal/analyses"
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"fmt"
	"strings"
	"text/template"

	"github.com/fabra-io/go-sdk/fabra"
)

var funnelQueryTemplate *template.Template
var stepSubqueryTemplate *template.Template
var rollupQueryTemplate *template.Template

func init() {
	funnelQueryTemplate = template.Must(template.New("funnelQuery").Parse(`
		{{ if .customTableQuery }}
			{{.customTableQuery}},
		{{ else }}
			WITH
		{{ end }}
		{{.stepSubqueryString}},
		{{.resultSubquery}}
		SELECT
			sum(count) as count,
			event,
			event_order,
			IFNULL((0.0+SUM(count))/NULLIF(MAX(MAX(count)) OVER({{ if .breakdown }} PARTITION BY {{.breakdown}} {{ end }}), 0), 0) AS percent,
			{{ if .breakdown }} {{.breakdown}}, {{ end }}
		FROM results
		GROUP BY event, event_order {{ if .breakdown }} , {{.breakdown}} {{ end }}
		ORDER BY event_order
	`))

	stepSubqueryTemplate = template.Must(template.New("stepSubQuery").Parse(`
		{{.tableName}} AS (
			SELECT
				DISTINCT {{.tableName}}.{{.userIdentifierColumn}},
				{{.tableName}}.{{.timestampColumn}},
				{{ if .breakdown }} {{.tableName}}.{{.breakdown}}, {{ end }}
			FROM {{.sourceTable}} AS {{.tableName}}
			{{ if .previous }}
				JOIN {{.previous}} ON {{.previous}}.{{.userIdentifierColumn}} = {{.tableName}}.{{.userIdentifierColumn}}
			{{ end }}
			WHERE {{.tableName}}.{{.eventTypeColumn}} = "{{.stepName}}"
			{{range $filterClause := .filterClauses}}
				AND {{$filterClause}}
			{{end}}
			{{ if .previous }}
				AND {{.previous}}.{{.timestampColumn}} < {{.tableName}}.{{.timestampColumn}}
			{{ end }}
		)
	`))

	rollupQueryTemplate = template.Must(template.New("rollupQuery").Parse(`
		SELECT
			COUNT(DISTINCT {{.userIdentifierColumn}}) AS count,
			'{{.stepName}}' AS event,
			{{.eventOrder}} AS event_order,
			{{ if .breakdown }} {{.breakdown}}, {{ end }}
		FROM {{.subQueryName}}
		{{ if .breakdown }} GROUP BY {{.breakdown}} {{ end }}
	`))
}

func (qs QueryServiceImpl) RunFunnelQuery(analysis *models.Analysis) (*fabra.QueryResult, error) {
	if !analysis.ConnectionID.Valid {
		return nil, errors.NewBadRequest("no data connection configured")
	}

	if !analysis.EventSetID.Valid {
		return nil, errors.NewBadRequest("no event set configured")
	}

	if analysis.AnalysisType != models.AnalysisTypeFunnel {
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

	steps, err := analyses.LoadEventsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, err
	}

	filters, err := analyses.LoadEventFiltersByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, err
	}

	var breakdownPtr *string
	if analysis.BreakdownPropertyName.Valid {
		breakdownPtr = &analysis.BreakdownPropertyName.String
	}

	queryString, err := createFunnelQuery(eventSet, views.ConvertEvents(steps, filters), breakdownPtr)
	if err != nil {
		return nil, err
	}

	return qs.runQuery(dataConnection, *queryString)
}

func createFunnelQuery(eventSet *models.EventSet, steps []views.Event, breakdownPtr *string) (*string, error) {
	var customTableQuery string
	if eventSet.CustomJoin.Valid {
		customTableQuery = createCustomTableQuery(eventSet)
	}

	var stepSubqueryArray []string
	for i, step := range steps {
		var previous string
		if i > 0 {
			previous = toSubqueryTitle(steps[i-1].Name, i-1)
		}

		stepSubquery, err := createStepSubquery(eventSet, step, i, previous, eventSet.CustomJoin.Valid, breakdownPtr)
		if err != nil {
			return nil, err
		}

		stepSubqueryArray = append(stepSubqueryArray, *stepSubquery)
	}

	stepSubqueryString := strings.Join(stepSubqueryArray, ", ")

	resultSubquery, err := createResultsSubquery(eventSet, steps, breakdownPtr)
	if err != nil {
		return nil, err
	}

	query, err := executeTemplate(funnelQueryTemplate, map[string]interface{}{
		"customTableQuery":   customTableQuery,
		"stepSubqueryString": stepSubqueryString,
		"resultSubquery":     resultSubquery,
		"breakdown":          breakdownPtr,
	})

	return query, err
}

func createStepSubquery(eventSet *models.EventSet, funnelStep views.Event, order int, previous string, usingCustomTableQuery bool, breakdownPtr *string) (*string, error) {
	tableName := toSubqueryTitle(funnelStep.Name, order)

	var sourceTable string
	if usingCustomTableQuery {
		sourceTable = "custom_events"
	} else {
		sourceTable = eventSet.DatasetName.String + "." + eventSet.TableName.String
	}

	var filterClauses []string
	for _, filter := range funnelStep.Filters {
		filterClauses = append(filterClauses, toSQL(tableName, filter))
	}

	queryArray, err := executeTemplate(stepSubqueryTemplate, map[string]interface{}{
		"tableName":            tableName,
		"sourceTable":          sourceTable,
		"eventTypeColumn":      eventSet.EventTypeColumn,
		"userIdentifierColumn": eventSet.UserIdentifierColumn,
		"timestampColumn":      eventSet.TimestampColumn,
		"previous":             previous,
		"stepName":             funnelStep.Name,
		"filterClauses":        filterClauses,
		"breakdown":            breakdownPtr,
	})

	return queryArray, err
}

func createResultsSubquery(eventSet *models.EventSet, steps []views.Event, breakdownPtr *string) (string, error) {
	var rollupArray []string
	for i, step := range steps {
		subQueryName := toSubqueryTitle(step.Name, i)
		rollupQuery, err := executeTemplate(rollupQueryTemplate, map[string]interface{}{
			"subQueryName":         subQueryName,
			"stepName":             step.Name,
			"userIdentifierColumn": eventSet.UserIdentifierColumn,
			"eventOrder":           fmt.Sprint(i),
			"breakdown":            breakdownPtr,
		})
		if err != nil {
			return "", err
		}

		rollupArray = append(rollupArray, *rollupQuery)
	}

	return "results AS ( " + strings.Join(rollupArray, " UNION ALL ") + " )", nil
}

func toSQL(tableName string, stepFilter views.EventFilter) string {
	var propertyValue string
	switch stepFilter.Property.Type {
	case models.PropertyTypeInteger:
		propertyValue = stepFilter.PropertyValue
	case models.PropertyTypeString:
		// Strings must be enclosed with quotes for SQL
		propertyValue = `"` + stepFilter.PropertyValue + `"`
	case models.PropertyTypeTimestamp:
		// TODO: this only works for BigQuery timestamps
		propertyValue = `"` + stepFilter.PropertyValue + `"`
	}

	switch stepFilter.FilterType {
	case models.FilterTypeEqual:
		return tableName + "." + stepFilter.Property.Name + " = " + propertyValue
	case models.FilterTypeNotEqual:
		return tableName + "." + stepFilter.Property.Name + " <> " + propertyValue
	case models.FilterTypeGreaterThan:
		return tableName + "." + stepFilter.Property.Name + " > " + propertyValue
	case models.FilterTypeLessThan:
		return tableName + "." + stepFilter.Property.Name + " < " + propertyValue
	case models.FilterTypeContains:
		// TODO
		return ""
	case models.FilterTypeNotContains:
		// TODO
		return ""
	default:
		return "true" // This will be added as an AND clause, so just let it pass
	}
}

func toSubqueryTitle(eventName string, order int) string {
	return strings.ReplaceAll(eventName, " ", "_") + fmt.Sprint(order)
}
