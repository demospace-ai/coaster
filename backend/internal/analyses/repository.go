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
) (*models.Analysis, error) {
	analysis := models.Analysis{
		UserID:         userID,
		OrganizationID: organizationID,
		AnalysisType:   analysisType,
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
	query *string,
) (*models.Analysis, error) {
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

	// TODO: decide if this should be limited to the original user or not
	result := db.Save(&analysis)
	if result.Error != nil {
		return nil, result.Error
	}

	return &analysis, nil
}

func CreateFunnelStepsAndFilters(
	db *gorm.DB,
	analysisID int64,
	funnelSteps []views.FunnelStep,
) ([]models.FunnelStep, []models.StepFilter, error) {
	var createdFunnelSteps []models.FunnelStep
	var createdStepFilters []models.StepFilter
	for _, funnelStep := range funnelSteps {
		funnelStepModel := models.FunnelStep{
			AnalysisID: analysisID,
			StepName:   funnelStep.Name,
		}

		result := db.Create(&funnelStepModel)
		if result.Error != nil {
			return nil, nil, result.Error
		}

		for _, filter := range funnelStep.Filters {
			filterModel := models.StepFilter{
				AnalysisID:    analysisID,
				StepID:        funnelStepModel.ID,
				PropertyName:  filter.Property.Name,
				PropertyType:  filter.Property.Type,
				FilterType:    filter.FilterType,
				PropertyValue: filter.PropertyValue,
			}

			result := db.Create(&filterModel)
			if result.Error != nil {
				return nil, nil, result.Error
			}

			createdStepFilters = append(createdStepFilters, filterModel)
		}

		createdFunnelSteps = append(createdFunnelSteps, funnelStepModel)
	}

	return createdFunnelSteps, createdStepFilters, nil
}

func DeactivateFunnelSteps(
	db *gorm.DB,
	analysisID int64,
) error {
	currentTime := time.Now()
	result := db.Table("funnel_steps").
		Where("analysis_id = ?", analysisID).
		Update("deactivated_at", currentTime)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

func LoadFunnelStepsByAnalysisID(
	db *gorm.DB,
	analysisID int64,
) ([]models.FunnelStep, error) {
	var funnelSteps []models.FunnelStep
	result := db.Table("funnel_steps").
		Select("funnel_steps.*").
		Where("funnel_steps.analysis_id = ?", analysisID).
		Where("funnel_steps.deactivated_at IS NULL").
		Order("funnel_steps.id ASC").
		Find(&funnelSteps)

	if result.Error != nil {
		return nil, result.Error
	}

	return funnelSteps, nil
}

func LoadStepFiltersByAnalysisID(
	db *gorm.DB,
	analysisID int64,
) ([]models.StepFilter, error) {
	var stepFilters []models.StepFilter
	result := db.Table("step_filters").
		Select("step_filters.*").
		Where("step_filters.analysis_id = ?", analysisID).
		Where("step_filters.deactivated_at IS NULL").
		Order("step_filters.id ASC").
		Find(&stepFilters)

	if result.Error != nil {
		return nil, result.Error
	}

	return stepFilters, nil
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
