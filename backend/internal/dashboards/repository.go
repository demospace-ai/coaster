package dashboards

import (
	"fabra/internal/database"
	"fabra/internal/models"
	"fabra/internal/views"
	"time"

	"gorm.io/gorm"
)

const PAGE_SIZE = 50

func CreateDashboard(
	db *gorm.DB,
	userID int64,
	organizationID int64,
	title string,
) (*models.Dashboard, error) {
	dashboard := models.Dashboard{
		UserID:         userID,
		OrganizationID: organizationID,
		Title:          title,
	}

	result := db.Create(&dashboard)
	if result.Error != nil {
		return nil, result.Error
	}

	return &dashboard, nil
}

func UpdateDashboard(
	db *gorm.DB,
	userID int64,
	organizationID int64,
	dashboard models.Dashboard,
	title *string,
	description *string,
) (*models.Dashboard, error) {
	// Any fields left empty will be unchanged
	if title != nil {
		dashboard.Title = *title
	}

	if description != nil {
		dashboard.Description = database.NewNullString(*description)
	}

	// TODO: decide if this should be limited to the original user or not
	result := db.Save(&dashboard)
	if result.Error != nil {
		return nil, result.Error
	}

	return &dashboard, nil
}

func LoadDashboardByID(db *gorm.DB, organizationID int64, dashboardID int64) (*models.Dashboard, error) {
	var dashboard models.Dashboard
	result := db.Table("dashboards").
		Select("dashboards.*").
		Where("dashboards.id = ?", dashboardID).
		Where("dashboards.organization_id = ?", organizationID).
		Where("dashboards.deactivated_at IS NULL").
		Take(&dashboard)

	if result.Error != nil {
		return nil, result.Error
	}

	return &dashboard, nil
}

func CreatePanels(
	db *gorm.DB,
	dashboardID int64,
	panels []views.DashboardPanel,
) ([]models.DashboardPanel, error) {
	var createdPanels []models.DashboardPanel
	for _, panel := range panels {
		panelModel := models.DashboardPanel{
			DashboardID: dashboardID,
			Title:       panel.Title,
			PanelType:   panel.PanelType,
		}

		if panel.AnalysisID != nil {
			panelModel.AnalysisID = database.NewNullInt64(*panel.AnalysisID)
		}

		result := db.Create(&panelModel)
		if result.Error != nil {
			return nil, result.Error
		}

		createdPanels = append(createdPanels, panelModel)
	}

	return createdPanels, nil
}

func DeactivatePanels(
	db *gorm.DB,
	dashboardID int64,
) error {
	currentTime := time.Now()
	result := db.Table("dashboard_panels").
		Where("dashboard_id = ?", dashboardID).
		Update("deactivated_at", currentTime)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

func LoadPanelsByDashboardID(
	db *gorm.DB,
	dashboardID int64,
) ([]models.DashboardPanel, error) {
	var panels []models.DashboardPanel
	result := db.Table("dashboard_panels").
		Select("dashboard_panels.*").
		Where("dashboard_panels.dashboard_id = ?", dashboardID).
		Where("dashboard_panels.deactivated_at IS NULL").
		Order("dashboard_panels.id ASC").
		Find(&panels)

	if result.Error != nil {
		return nil, result.Error
	}

	return panels, nil
}

func LoadAllDashboards(db *gorm.DB, page int, organizationID int64) ([]models.Dashboard, error) {
	offset := page * PAGE_SIZE
	var dashboards []models.Dashboard
	result := db.Table("dashboards").
		Select("dashboards.*").
		Where("dashboards.organization_id = ?", organizationID).
		Where("dashboards.deactivated_at IS NULL").
		Offset(offset).
		Limit(PAGE_SIZE).
		Order("dashboards.created_at ASC").
		Find(&dashboards)

	if result.Error != nil {
		return nil, result.Error
	}

	return dashboards, nil
}
