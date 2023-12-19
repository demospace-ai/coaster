package itinerary_steps

import (
	"time"

	"go.fabra.io/server/common/errors"
	"go.fabra.io/server/common/input"
	"go.fabra.io/server/common/models"
	"gorm.io/gorm"
)

func createItineraryStep(db *gorm.DB, listingID int64, stepInput input.ItineraryStep, stepOrder int64) (*models.ItineraryStep, error) {
	if stepInput.Title == nil || stepInput.Description == nil || stepInput.StepLabel == nil {
		return nil, errors.NewCustomerVisibleError("Missing required fields for new itinerary step")
	}

	itineraryStep := models.ItineraryStep{
		ListingID:   listingID,
		Title:       *stepInput.Title,
		Description: *stepInput.Description,
		StepLabel:   *stepInput.StepLabel,
		StepOrder:   stepOrder,
	}

	err := db.Create(&itineraryStep).Error
	if err != nil {
		return nil, errors.Wrap(err, "(itinerary_steps.UpdateItinerarySteps) creating itinerary step")
	}

	return &itineraryStep, nil
}

func updateItineraryStep(db *gorm.DB, step models.ItineraryStep, stepInput input.ItineraryStep, stepOrder int64) (*models.ItineraryStep, error) {
	if stepInput.Title != nil {
		step.Title = *stepInput.Title
	}

	if stepInput.Description != nil {
		step.Description = *stepInput.Description
	}

	if stepInput.StepLabel != nil {
		step.StepLabel = *stepInput.StepLabel
	}

	step.StepOrder = stepOrder

	err := db.Save(&step).Error
	if err != nil {
		return nil, errors.Wrapf(err, "(itinerary_steps.UpdateItinerarySteps) updating itinerary step %+v", step)
	}

	return &step, nil
}

func UpdateItinerarySteps(db *gorm.DB, listingID int64, itineraryStepInput []input.ItineraryStep) ([]models.ItineraryStep, error) {
	existingSteps, err := LoadItineraryForListing(db, listingID)
	if err != nil {
		return nil, errors.Wrap(err, "(itinerary_steps.UpdateItinerarySteps) loading itinerary steps for listing")
	}

	itineraryStepIdMap := make(map[int64]models.ItineraryStep)
	for _, step := range existingSteps {
		itineraryStepIdMap[step.ID] = step
	}

	var newSteps []models.ItineraryStep = make([]models.ItineraryStep, len(itineraryStepInput))
	var updatedStepIds map[int64]bool = make(map[int64]bool)
	for i, stepInput := range itineraryStepInput {
		if stepInput.ID == nil {
			// Create a new itinerary step
			newStep, err := createItineraryStep(db, listingID, stepInput, int64(i))
			if err != nil {
				return nil, errors.Wrap(err, "(itinerary_steps.UpdateItinerarySteps) creating new itinerary step")
			}

			newSteps[i] = *newStep
		} else {
			// Update existing step
			existingStep, ok := itineraryStepIdMap[*stepInput.ID]
			if !ok {
				return nil, errors.NewCustomerVisibleErrorf("Invalid itinerary step ID: %d", stepInput.ID)
			}

			updatedStep, err := updateItineraryStep(db, existingStep, stepInput, int64(i))
			if err != nil {
				return nil, errors.Wrap(err, "(itinerary_steps.UpdateItinerarySteps) updating itinerary step")
			}

			updatedStepIds[existingStep.ID] = true

			newSteps[i] = *updatedStep
		}
	}

	for _, step := range existingSteps {
		// Delete any existing steps that weren't in the input list
		_, ok := updatedStepIds[step.ID]
		if !ok {
			result := db.Model(step).Update("deactivated_at", time.Now())
			if result.Error != nil {
				return nil, errors.Wrapf(err, "(itinerary_steps.UpdateItinerarySteps) deleting itinerary step %+v", step)
			}
		}
	}

	return newSteps, nil
}

func LoadItineraryForListing(db *gorm.DB, listingID int64) ([]models.ItineraryStep, error) {
	var itinerarySteps []models.ItineraryStep
	result := db.Table("itinerary_steps").
		Select("itinerary_steps.*").
		Where("itinerary_steps.listing_id = ?", listingID).
		Where("itinerary_steps.deactivated_at IS NULL").
		Order("itinerary_steps.step_order ASC").
		Find(&itinerarySteps)
	if result.Error != nil {
		// Not guaranteed to have any itinerary steps for a listing so just return an empty slice
		if errors.IsRecordNotFound(result.Error) {
			return []models.ItineraryStep{}, nil
		} else {
			return nil, errors.Wrap(result.Error, "(itinerary_steps.LoadItineraryForListing)")
		}
	}

	return itinerarySteps, nil
}
