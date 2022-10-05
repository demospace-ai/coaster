package query

import (
	"fabra/internal/analyses"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
	"fabra/internal/views"
	"fmt"
	"strings"
	"text/template"
)

var funnelQueryTemplate *template.Template
var stepSubqueryTemplate *template.Template

func init() {
	funnelQueryTemplate = template.Must(template.New("funnelQuery").Parse(`
		{{ if .customTableQuery }}
			{{.customTableQuery}},
		{{ else }}
			WITH
		{{ end }}
		{{.stepSubqueryString}},
		{{.resultSubquery}}
		SELECT count, event, (count / (SELECT MAX(count) FROM results)) as percent from results ORDER BY results.event_order
	`))

	stepSubqueryTemplate = template.Must(template.New("stepSubQuery").Parse(`
		{{.tableName}} AS (
			SELECT DISTINCT {{.tableName}}.{{.userIdentifierColumn}}, {{.tableName}}.{{.timestampColumn}}
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
}

type FunnelStep struct {
	Name    string
	Filters []models.StepFilter
}

func (qs QueryServiceImpl) RunFunnelQuery(dataConnection *models.DataConnection, analysis *models.Analysis) (views.Schema, []views.Row, error) {
	if !analysis.EventSetID.Valid {
		return nil, nil, errors.NewBadRequest("no event set configured")
	}

	eventSet, err := eventsets.LoadEventSetByID(qs.db, analysis.OrganizationID, analysis.EventSetID.Int64)
	if err != nil {
		return nil, nil, err
	}

	steps, err := analyses.LoadFunnelStepsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, nil, err
	}

	filters, err := analyses.LoadStepFiltersByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, nil, err
	}

	queryString, err := createFunnelQuery(eventSet, convertFunnelSteps(steps, filters))
	if err != nil {
		return nil, nil, err
	}

	return qs.RunQuery(dataConnection, *queryString)
}

func createFunnelQuery(eventSet *models.EventSet, steps []FunnelStep) (*string, error) {
	var customTableQuery string
	if eventSet.CustomJoin.Valid {
		customTableQuery = createCustomTableQuery(eventSet)
	}

	var stepSubqueryArray []string
	for i, step := range steps {
		var previous string
		if i > 0 {
			previous = steps[i-1].Name + "_" + fmt.Sprint(i-1)
		}

		stepSubquery, err := createStepSubquery(eventSet, step, i, previous, eventSet.CustomJoin.Valid)
		if err != nil {
			return nil, err
		}

		stepSubqueryArray = append(stepSubqueryArray, *stepSubquery)
	}

	stepSubqueryString := strings.Join(stepSubqueryArray, ", ")

	resultSubquery := createResultsSubquery(eventSet, steps)

	query, err := executeTemplate(funnelQueryTemplate, map[string]interface{}{
		"customTableQuery":   customTableQuery,
		"stepSubqueryString": stepSubqueryString,
		"resultSubquery":     resultSubquery,
	})

	return query, err
}

func createStepSubquery(eventSet *models.EventSet, funnelStep FunnelStep, order int, previous string, usingCustomTableQuery bool) (*string, error) {
	tableName := funnelStep.Name + "_" + fmt.Sprint(order)

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
	})

	return queryArray, err
}

func createResultsSubquery(eventSet *models.EventSet, steps []FunnelStep) string {
	var rollupArray []string
	for i, step := range steps {
		rollupArray = append(rollupArray,
			"SELECT COUNT(DISTINCT "+eventSet.UserIdentifierColumn+") AS count, '"+step.Name+"' AS event, "+fmt.Sprint(i)+" AS event_order FROM "+step.Name+"_"+fmt.Sprint(i),
		)
	}

	return "results AS ( " + strings.Join(rollupArray, " UNION ALL ") + " )"
}

func convertFunnelSteps(funnelSteps []models.FunnelStep, stepFilters []models.StepFilter) []FunnelStep {
	filterMap := map[int64][]models.StepFilter{} // Step ID to slice of filter SQL clauses
	for _, stepFilter := range stepFilters {
		filterMap[stepFilter.StepID] = append(filterMap[stepFilter.StepID], stepFilter)
	}

	funnelStepsView := []FunnelStep{}
	for _, funnelStep := range funnelSteps {
		view := FunnelStep{
			Name:    funnelStep.StepName,
			Filters: filterMap[funnelStep.ID],
		}
		funnelStepsView = append(funnelStepsView, view)
	}

	return funnelStepsView
}

func toSQL(tableName string, stepFilter models.StepFilter) string {
	var propertyValue string
	switch stepFilter.PropertyType {
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
		return tableName + "." + stepFilter.PropertyName + " = " + propertyValue
	case models.FilterTypeNotEqual:
		return tableName + "." + stepFilter.PropertyName + " <> " + propertyValue
	case models.FilterTypeGreaterThan:
		return tableName + "." + stepFilter.PropertyName + " > " + propertyValue
	case models.FilterTypeLessThan:
		return tableName + "." + stepFilter.PropertyName + " < " + propertyValue
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
