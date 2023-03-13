package sync_runs

import (
	"time"

	"go.fabra.io/server/common/database"
	"go.fabra.io/server/common/models"

	"gorm.io/gorm"
)

func CreateSyncRun(
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

func CompleteSyncRun(db *gorm.DB, syncRun *models.SyncRun, status models.SyncRunStatus, syncError string) (*models.SyncRun, error) {
	updates := models.SyncRun{
		CompletedAt: time.Now(),
		Status:      status,
	}

	if len(syncError) > 0 {
		updates.Error = database.NewNullString(syncError)
	}

	result := db.Model(syncRun).Updates(updates)
	if result.Error != nil {
		return nil, result.Error
	}

	return syncRun, nil
}
