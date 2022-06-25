package posts

import (
	"database/sql"
	"fabra/internal/database"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateQuestion(db *gorm.DB, questionTitle string, questionBody string, userID int64, organizationID int64, assignedUserID *int64) (*models.Post, error) {
	post := models.Post{
		PostType:       models.PostTypeQuestion,
		Title:          database.NewNullString(questionTitle),
		Body:           questionBody,
		UserID:         userID,
		OrganizationID: organizationID,
	}

	if assignedUserID != nil {
		post.AssignedUserID = database.NewNullInt64(*assignedUserID)
	}

	result := db.Create(&post)
	if result.Error != nil {
		return nil, result.Error
	}

	return &post, nil
}

func LoadQuestionByID(db *gorm.DB, questionID int64, organizationID int64) (*models.Post, error) {
	var question models.Post
	result := db.Table("posts").
		Select("posts.*").
		Where("posts.id = ?", questionID).
		Where("posts.deactivated_at IS NULL").
		Take(&question)

	if result.Error != nil {
		return nil, result.Error
	}

	return &question, nil
}

func LoadAnswersByQuestionID(db *gorm.DB, questionID int64, organizationID int64) ([]models.Post, error) {
	var answers []models.Post
	result := db.Table("posts").
		Select("posts.*").
		Where("posts.parent_post_id = ?", questionID).
		Where("posts.deactivated_at IS NULL").
		Find(&answers)

	if result.Error != nil {
		return nil, result.Error
	}

	return answers, nil
}

func CreateAnswer(db *gorm.DB, questionID int64, answerBody string, userID int64, organizationID int64) (*models.Post, error) {
	post := models.Post{
		PostType:       models.PostTypeAnswer,
		ParentPostID:   database.NewNullInt64(questionID),
		Body:           answerBody,
		UserID:         userID,
		OrganizationID: organizationID,
	}

	result := db.Create(&post)
	if result.Error != nil {
		return nil, result.Error
	}

	return &post, nil
}

func Search(db *gorm.DB, searchQuery string, organizationID int64) ([]models.Post, error) {
	var posts []models.Post
	result := db.Raw(
		"SELECT *, ts_rank((setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B')), @query) as rank FROM posts WHERE posts.organization_id = @organizationID AND posts.deactivated_at IS NULL AND (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B')) @@ to_tsquery('english', @query) ORDER BY rank desc",
		sql.Named("organizationID", organizationID), sql.Named("query", searchQuery)).
		Scan(&posts)

	if result.Error != nil {
		return nil, result.Error
	}

	return posts, nil
}
