package posts

import (
	"database/sql"
	"fabra/internal/models"

	"gorm.io/gorm"
)

func CreateQuestion(db *gorm.DB, questionTitle string, questionBody string, userID int64) (*models.Post, error) {
	post := models.Post{
		PostType: models.PostTypeQuestion,
		Title:    sql.NullString{String: questionTitle},
		Body:     questionBody,
		UserID:   userID,
	}

	result := db.Create(&post)
	if result.Error != nil {
		return nil, result.Error
	}

	return &post, nil
}

func Search(db *gorm.DB, searchQuery string) ([]models.Post, error) {
	var posts []models.Post
	result := db.Raw(
		"SELECT *, ts_rank((setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B')), @query) as rank FROM posts WHERE (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', body), 'B')) @@ to_tsquery('english', @query) ORDER BY rank desc",
		sql.Named("query", searchQuery)).
		Scan(&posts)

	if result.Error != nil {
		return nil, result.Error
	}

	return posts, nil
}
