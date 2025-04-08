package store

import (
	"database/sql"
	"fmt"
)

func CreateUser(username string, sessionID *string) (int, error) {
	var userID int
	query := `INSERT INTO users (username, session_id) VALUES ($1, $2) RETURNING id`
	err := db.QueryRow(query, username, sessionID).Scan(&userID)
	return userID, err
}

func UpdateUserSession(userID int, sessionID string) error {
	query := `UPDATE users SET session_id = $1 WHERE id = $2`
	_, err := db.Exec(query, sessionID, userID)
	return err
}

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

// Player represents a minimal player structure.
type Player struct {
	ID       int    `json:"user_id"`
	Username string `json:"username"`
}

// GetPlayersBySession returns all players in a given session.
func GetPlayersBySession(sessionID string) ([]Player, error) {
	query := `SELECT id, username FROM users WHERE session_id = $1`
	rows, err := db.Query(query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query players: %w", err)
	}
	defer rows.Close()

	var players []Player
	for rows.Next() {
		var p Player
		if err := rows.Scan(&p.ID, &p.Username); err != nil {
			return nil, fmt.Errorf("failed to scan player: %w", err)
		}
		players = append(players, p)
	}
	return players, nil
}
