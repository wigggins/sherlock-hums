package store

import (
	"database/sql"
	"fmt"
)

func CreateUser(username string, sessionID *string, avatarType, avatarColor string) (int, error) {
	var userID int
	query := `
		INSERT INTO users (username, session_id, avatar_type, avatar_color)
		VALUES ($1, $2, $3, $4) RETURNING id
	`
	err := db.QueryRow(query, username, sessionID, avatarType, avatarColor).Scan(&userID)
	return userID, err
}

func UpdateUserSession(userID int, sessionID string) error {
	query := `UPDATE users SET session_id = $1 WHERE id = $2`
	_, err := db.Exec(query, sessionID, userID)
	return err
}

// used to validation if a user belongs to a session
func GetUserSession(userID int) (string, error) {
	var sessionID sql.NullString
	query := `SELECT session_id FROM users WHERE id = $1`
	err := db.QueryRow(query, userID).Scan(&sessionID)
	if err != nil {
		return "", err
	}
	// Return empty string if session_id is NULL
	if !sessionID.Valid {
		return "", nil
	}
	return sessionID.String, nil
}

type Player struct {
	ID          int    `json:"user_id"`
	Username    string `json:"username"`
	AvatarColor string `json:"avatar_color"`
	AvatarType  string `json:"avatar_type"`
}

// GetPlayersBySession returns all players in a given session.
func GetPlayersBySession(sessionID string) ([]Player, error) {
	query := `SELECT id, username, avatar_color, avatar_type FROM users WHERE session_id = $1`
	rows, err := db.Query(query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query players: %w", err)
	}
	defer rows.Close()

	var players []Player
	for rows.Next() {
		var p Player
		if err := rows.Scan(&p.ID, &p.Username, &p.AvatarColor, &p.AvatarType); err != nil {
			return nil, fmt.Errorf("failed to scan player: %w", err)
		}
		players = append(players, p)
	}
	return players, nil
}
