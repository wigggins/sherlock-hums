package store

import "database/sql"

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
