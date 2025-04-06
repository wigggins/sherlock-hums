package store

import (
	"fmt"
)

// GetScores retrieves the scores for all users in the given session.
func GetScores(sessionID string) ([]struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Score    int    `json:"score"`
}, error) {
	query := `
		SELECT id, username, score
		FROM users
		WHERE session_id = $1
		ORDER BY score DESC
	`
	rows, err := db.Query(query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query scores: %w", err)
	}
	defer rows.Close()

	var scores []struct {
		UserID   int    `json:"user_id"`
		Username string `json:"username"`
		Score    int    `json:"score"`
	}
	for rows.Next() {
		var s struct {
			UserID   int    `json:"user_id"`
			Username string `json:"username"`
			Score    int    `json:"score"`
		}
		if err := rows.Scan(&s.UserID, &s.Username, &s.Score); err != nil {
			return nil, fmt.Errorf("failed to scan score row: %w", err)
		}
		scores = append(scores, s)
	}
	return scores, nil
}
