package analyses

import (
	"database/sql"
	"fabra/internal/models"

	"gorm.io/gorm"
)

const PAGE_SIZE = 20

func CreateAnalysis(db *gorm.DB, userID int64, organizationID int64, analysisType models.AnalysisType) (*models.Analysis, error) {
	post := models.Analysis{
		UserID:         userID,
		OrganizationID: organizationID,
		AnalysisType:   analysisType,
	}

	result := db.Create(&post)
	if result.Error != nil {
		return nil, result.Error
	}

	return &post, nil
}

func LoadAnalysisByID(db *gorm.DB, analysisID int64, organizationID int64) (*models.Analysis, error) {
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
