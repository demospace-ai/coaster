package query

import (
	"fabra/internal/dataconnections"
	"fabra/internal/errors"
	"fabra/internal/models"
	"fabra/internal/views"
)

func (qs QueryServiceImpl) RunCustomQuery(analysis *models.Analysis) (*views.QueryResult, error) {
	if !analysis.ConnectionID.Valid {
		return nil, errors.NewBadRequest("no data connection configured")
	}

	if !analysis.Query.Valid {
		return nil, errors.NewBadRequest("no query specified")
	}

	if analysis.AnalysisType != models.AnalysisTypeCustomQuery {
		return nil, errors.NewBadRequest("wrong analysis type")
	}

	dataConnection, err := dataconnections.LoadDataConnectionByID(qs.db, analysis.OrganizationID, analysis.ConnectionID.Int64)
	if err != nil {
		return nil, err
	}

	return qs.runQuery(dataConnection, analysis.Query.String)
}
