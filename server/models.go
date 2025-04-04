package main

import (
	"database/sql"
	"math/rand"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func createUser(username string, sessionID *string) (int, error) {
	var userID int
	query := `INSERT INTO users (username, session_id) VALUES ($1, $2) RETURNING id`
	err := db.QueryRow(query, username, sessionID).Scan(&userID)
	return userID, err
}

func createSession(sessionID string, hostID int) error {
	query := `INSERT INTO sessions (id, host_id, state) VALUES ($1, $2, 'WAITING')`
	_, err := db.Exec(query, sessionID, hostID)
	return err
}

func updateUserSession(userID int, sessionID string) error {
	query := `UPDATE users SET session_id = $1 WHERE id = $2`
	_, err := db.Exec(query, sessionID, userID)
	return err
}

func sessionExists(sessionID string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM sessions WHERE id = $1)`
	err := db.QueryRow(query, sessionID).Scan(&exists)
	return exists, err
}

// generateSessionID creates a random 6-character alphanumeric string
func generateSessionID() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var seededRand = rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func createSongSubmission(userID int, sessionID, songURL string, submissionOrder int) error {
	query := `
		INSERT INTO song_submissions (user_id, session_id, song_url, submission_order)
		VALUES ($1, $2, $3, $4)
	`
	_, err := db.Exec(query, userID, sessionID, songURL, submissionOrder)
	return err
}

func getUserSession(userID int) (string, error) {
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
