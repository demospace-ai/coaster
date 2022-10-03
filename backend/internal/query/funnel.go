package query

import (
	"fabra/internal/analyses"
	"fabra/internal/errors"
	"fabra/internal/eventsets"
	"fabra/internal/models"
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
			WHERE {{.tableName}}.{{.eventTypeColumn}} = '{{.stepName}}'
			{{ if .previous }}
				AND {{.previous}}.{{.timestampColumn}} < {{.tableName}}.{{.timestampColumn}}
			{{ end }}
		)
	`))
}

func (qs QueryServiceImpl) RunFunnelQuery(dataConnection *models.DataConnection, analysis *models.Analysis) (Schema, []Row, error) {
	if !analysis.EventSetID.Valid {
		return nil, nil, errors.NewBadRequest("no event set configured")
	}

	eventSet, err := eventsets.LoadEventSetByID(qs.db, analysis.OrganizationID, analysis.EventSetID.Int64)
	if err != nil {
		return nil, nil, err
	}

	events, err := analyses.LoadFunnelStepsByAnalysisID(qs.db, analysis.ID)
	if err != nil {
		return nil, nil, err
	}

	queryString, err := createFunnelQuery(eventSet, events)
	if err != nil {
		return nil, nil, err
	}

	return qs.RunQuery(dataConnection, *queryString)
}

func createFunnelQuery(eventSet *models.EventSet, events []models.FunnelStep) (*string, error) {
	var customTableQuery string
	if eventSet.CustomJoin.Valid {
		customTableQuery = createCustomTableQuery(eventSet)
	}

	var stepSubqueryArray []string
	for i, event := range events {
		var previous string
		if i > 0 {
			previous = events[i-1].StepName + "_" + fmt.Sprint(i-1)
		}

		stepSubquery, err := createStepSubquery(eventSet, event.StepName, i, previous, eventSet.CustomJoin.Valid)
		if err != nil {
			return nil, err
		}

		stepSubqueryArray = append(stepSubqueryArray, *stepSubquery)
	}

	stepSubqueryString := strings.Join(stepSubqueryArray, ", ")

	resultSubquery := createResultsSubquery(eventSet, events)

	query, err := executeTemplate(funnelQueryTemplate, map[string]interface{}{
		"customTableQuery":   customTableQuery,
		"stepSubqueryString": stepSubqueryString,
		"resultSubquery":     resultSubquery,
	})

	return query, err
}

func createStepSubquery(eventSet *models.EventSet, stepName string, order int, previous string, usingCustomTableQuery bool) (*string, error) {
	tableName := stepName + "_" + fmt.Sprint(order)

	var sourceTable string
	if usingCustomTableQuery {
		sourceTable = "custom_events"
	} else {
		sourceTable = eventSet.DatasetName.String + "." + eventSet.TableName.String
	}

	queryArray, err := executeTemplate(stepSubqueryTemplate, map[string]interface{}{
		"tableName":            tableName,
		"sourceTable":          sourceTable,
		"eventTypeColumn":      eventSet.EventTypeColumn,
		"userIdentifierColumn": eventSet.UserIdentifierColumn,
		"timestampColumn":      eventSet.TimestampColumn,
		"previous":             previous,
		"stepName":             stepName,
	})

	return queryArray, err
}

func createResultsSubquery(eventSet *models.EventSet, events []models.FunnelStep) string {
	var rollupArray []string
	for i, event := range events {
		rollupArray = append(rollupArray,
			"SELECT COUNT(DISTINCT "+eventSet.UserIdentifierColumn+") AS count, '"+event.StepName+"' AS event, "+fmt.Sprint(i)+" AS event_order FROM "+event.StepName+"_"+fmt.Sprint(i),
		)
	}

	return "results AS ( " + strings.Join(rollupArray, " UNION ALL ") + " )"
}
