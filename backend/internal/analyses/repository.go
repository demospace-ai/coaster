package analyses

import (
	"database/sql"
	"fabra/internal/database"
	"fabra/internal/models"
	"fabra/internal/views"
	"time"

	"gorm.io/gorm"
)

const PAGE_SIZE = 50

func CreateAnalysis(
	db *gorm.DB,
	userID int64,
	organizationID int64,
	analysisType models.AnalysisType,
	connectionID *int64,
	eventSetID *int64,
	query *string,
	title string,
) (*models.Analysis, error) {
	analysis := models.Analysis{
		UserID:         userID,
		OrganizationID: organizationID,
		AnalysisType:   analysisType,
		Title:          title,
	}

	if connectionID != nil {
		analysis.ConnectionID = database.NewNullInt64(*connectionID)
	}

	if eventSetID != nil {
		analysis.EventSetID = database.NewNullInt64(*eventSetID)
	}

	if query != nil {
		analysis.Query = database.NewNullString(*query)
	}

	result := db.Create(&analysis)
	if result.Error != nil {
		return nil, result.Error
	}

	return &analysis, nil
}

func UpdateAnalysis(
	db *gorm.DB,
	userID int64,
	organizationID int64,
	analysis models.Analysis,
	connectionID *int64,
	eventSetID *int64,
	title *string,
	description *string,
	query *string,
	breakdown *views.Property,
) (*models.Analysis, error) {
	// Any fields left empty will be unchanged
	if connectionID != nil {
		analysis.ConnectionID = database.NewNullInt64(*connectionID)
		analysis.EventSetID = database.EmptyNullInt64 // New connection invalidates the event set
	}

	if eventSetID != nil {
		analysis.EventSetID = database.NewNullInt64(*eventSetID)
	}

	if query != nil {
		analysis.Query = database.NewNullString(*query)
	}

	if title != nil {
		analysis.Title = *title
	}

	if description != nil {
		analysis.Description = database.NewNullString(*description)
	}

	if breakdown != nil {
		analysis.BreakdownPropertyName = database.NewNullString(breakdown.Name)
		analysis.BreakdownPropertyType = breakdown.Type
	}

	// TODO: decide if this should be limited to the original user or not
	result := db.Save(&analysis)
	if result.Error != nil {
		return nil, result.Error
	}

	return &analysis, nil
}

func CreateEventsAndFilters(
	db *gorm.DB,
	analysisID int64,
	funnelSteps []views.Event,
) ([]models.Event, []models.EventFilter, error) {
	var createdEvents []models.Event
	var createdEventFilters []models.EventFilter
	for _, funnelStep := range funnelSteps {
		eventModel := models.Event{
			AnalysisID: analysisID,
			Name:       funnelStep.Name,
		}

		result := db.Create(&eventModel)
		if result.Error != nil {
			return nil, nil, result.Error
		}

		for _, filter := range funnelStep.Filters {
			filterModel := models.EventFilter{
				AnalysisID:    analysisID,
				EventID:       eventModel.ID,
				PropertyName:  filter.Property.Name,
				PropertyType:  filter.Property.Type,
				FilterType:    filter.FilterType,
				PropertyValue: filter.PropertyValue,
			}

			result := db.Create(&filterModel)
			if result.Error != nil {
				return nil, nil, result.Error
			}

			createdEventFilters = append(createdEventFilters, filterModel)
		}

		createdEvents = append(createdEvents, eventModel)
	}

	return createdEvents, createdEventFilters, nil
}

func DeactivateEvents(
	db *gorm.DB,
	analysisID int64,
) error {
	currentTime := time.Now()
	result := db.Table("events").
		Where("analysis_id = ?", analysisID).
		Update("deactivated_at", currentTime)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

func LoadEventsByAnalysisID(
	db *gorm.DB,
	analysisID int64,
) ([]models.Event, error) {
	var events []models.Event
	result := db.Table("events").
		Select("events.*").
		Where("events.analysis_id = ?", analysisID).
		Where("events.deactivated_at IS NULL").
		Order("events.id ASC").
		Find(&events)

	if result.Error != nil {
		return nil, result.Error
	}

	return events, nil
}

func LoadEventFiltersByAnalysisID(
	db *gorm.DB,
	analysisID int64,
) ([]models.EventFilter, error) {
	var eventFilters []models.EventFilter
	result := db.Table("event_filters").
		Select("event_filters.*").
		Where("event_filters.analysis_id = ?", analysisID).
		Where("event_filters.deactivated_at IS NULL").
		Order("event_filters.id ASC").
		Find(&eventFilters)

	if result.Error != nil {
		return nil, result.Error
	}

	return eventFilters, nil
}

func LoadAnalysisByID(db *gorm.DB, organizationID int64, analysisID int64) (*models.Analysis, error) {
	var analysis models.Analysis
	result := db.Table("analyses").
		Select("analyses.*").
		Where("analyses.id = ?", analysisID).
		Where("analyses.organization_id = ?", organizationID).
		Where("analyses.deactivated_at IS NULL").
		Take(&analysis)

	if result.Error != nil {
		return nil, result.Error
	}

	return &analysis, nil
}

func LoadAllAnalyses(db *gorm.DB, page int, organizationID int64) ([]models.Analysis, error) {
	offset := page * PAGE_SIZE
	var analyses []models.Analysis
	result := db.Table("analyses").
		Select("analyses.*").
		Where("analyses.organization_id = ?", organizationID).
		Where("analyses.deactivated_at IS NULL").
		Offset(offset).
		Limit(PAGE_SIZE).
		Order("analyses.created_at ASC").
		Find(&analyses)

	if result.Error != nil {
		return nil, result.Error
	}

	return analyses, nil
}

func DeactivateAnalyisByID(db *gorm.DB, organizationID int64, analysisID int64) error {
	currentTime := time.Now()
	result := db.Table("analyses").
		Where("analyses.id = ?", analysisID).
		Where("analyses.organization_id = ?", organizationID).
		Where("analyses.deactivated_at IS NULL").
		Update("deactivated_at", currentTime)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func Search(db *gorm.DB, searchQuery string, organizationID int64) ([]models.Analysis, error) {
	var analyses []models.Analysis
	result := db.Raw(
		"SELECT *, ts_rank(setweight(to_tsvector('english', coalesce(title, '')), 'A'), @query) as rank FROM analyses WHERE analyses.organization_id = @organizationID AND analyses.deactivated_at IS NULL AND setweight(to_tsvector('english', coalesce(title, '')), 'A') @@ to_tsquery('english', @query) ORDER BY rank desc",
		sql.Named("organizationID", organizationID), sql.Named("query", searchQuery)).
		Scan(&analyses)

	if result.Error != nil {
		return nil, result.Error
	}

	return analyses, nil
}
