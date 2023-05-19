package sync_runs

import (
	"time"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func QueueSyncRun(
	db *gorm.DB,
	organizationID int64,
	syncID int64,
) (*models.SyncRun, error) {
	syncRun := models.SyncRun{
		OrganizationID: organizationID,
		SyncID:         syncID,
		Status:         models.SyncRunStatusQueued,
		StartedAt:      time.Now(),
	}

	result := db.Create(&syncRun)
	if result.Error != nil {
		return nil, result.Error
	}

	return &syncRun, nil
}

func QueueAndStartSyncRun(
	db *gorm.DB,
	organizationID int64,
	syncID int64,
) (*models.SyncRun, error) {
	syncRun := models.SyncRun{
		OrganizationID: organizationID,
		SyncID:         syncID,
		Status:         models.SyncRunStatusRunning,
		StartedAt:      time.Now(),
	}

	result := db.Create(&syncRun)
	if result.Error != nil {
		return nil, result.Error
	}

	return &syncRun, nil
}

func StartSyncRun(
	db *gorm.DB,
	syncRun *models.SyncRun,
) (*models.SyncRun, error) {
	updates := models.SyncRun{
		Status:    models.SyncRunStatusRunning,
		StartedAt: time.Now(),
	}

	result := db.Model(syncRun).Updates(updates)
	if result.Error != nil {
		return nil, result.Error
	}

	return syncRun, nil
}

func CompleteSyncRun(db *gorm.DB, syncRun *models.SyncRun, status models.SyncRunStatus, syncError *string, rowsWritten int) (*models.SyncRun, error) {
	updates := models.SyncRun{
		CompletedAt: time.Now(),
		Status:      status,
		RowsWritten: rowsWritten,
	}

	if syncError != nil {
		updates.Error = database.NewNullString(*syncError)
	}

	result := db.Model(syncRun).Updates(updates)
	if result.Error != nil {
		return nil, result.Error
	}

	return syncRun, nil
}

func LoadAllRunsForSync(db *gorm.DB, organizationID int64, syncID int64) ([]models.SyncRun, error) {
	var syncRuns []models.SyncRun
	result := db.Table("sync_runs").
		Select("sync_runs.*").
		Where("sync_runs.organization_id = ?", organizationID).
		Where("sync_runs.sync_id = ?", syncID).
		Where("sync_runs.deactivated_at IS NULL").
		Order("sync_runs.created_at DESC").
		Find(&syncRuns)

	if result.Error != nil {
		return nil, result.Error
	}

	return syncRuns, nil
}

func LoadQueuedOrStartedRunsForSync(db *gorm.DB, organizationID int64, syncID int64) ([]models.SyncRun, error) {
	var syncRuns []models.SyncRun
	result := db.Table("sync_runs").
		Select("sync_runs.*").
		Where("sync_runs.organization_id = ?", organizationID).
		Where("sync_runs.sync_id = ?", syncID).
		Where("sync_runs.status IN (?, ?)", models.SyncRunStatusQueued, models.SyncRunStatusRunning).
		Where("sync_runs.deactivated_at IS NULL").
		Order("sync_runs.created_at DESC").
		Find(&syncRuns)

	if result.Error != nil {
		return nil, result.Error
	}

	return syncRuns, nil
}
