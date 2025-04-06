package store

import (
	"fmt"
	"math/rand"
	"time"
)

type GameRound struct {
	ID               int
	SessionID        string
	SongSubmissionID int
	RoundNumber      int
	Played           bool
	CreatedAt        time.Time
}

func CreateGameRounds(sessionID string) error {
	submissions, err := GetSongSubmissions(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get song submissions: %w", err)
	}

	if len(submissions) == 0 {
		return fmt.Errorf("no song submissions found for session %s", sessionID)
	}

	// randomize the submissions order
	rand.Shuffle(len(submissions), func(i, j int) {
		submissions[i], submissions[j] = submissions[j], submissions[i]
	})

	// insert each submission as a game round with an increasing round number
	for i, submission := range submissions {
		roundNumber := i + 1
		query := `
			INSERT INTO game_rounds (session_id, song_submission_id, round_number, played)
			VALUES ($1, $2, $3, FALSE)
		`
		_, err := db.Exec(query, sessionID, submission.ID, roundNumber)
		if err != nil {
			return fmt.Errorf("failed to create game round %d: %w", roundNumber, err)
		}
	}

	return nil
}

func CompleteRound(roundID int) error {
	// begin a transaction to ensure consistency.
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// query all guesses for this round that are correct.
	query := `
		SELECT user_id
		FROM guesses
		WHERE round_id = $1 AND correct = true
	`
	rows, err := tx.Query(query, roundID)
	if err != nil {
		return fmt.Errorf("failed to query guesses: %w", err)
	}
	defer rows.Close()

	var userIDs []int
	for rows.Next() {
		var userID int
		if err := rows.Scan(&userID); err != nil {
			return fmt.Errorf("failed to scan userID: %w", err)
		}
		userIDs = append(userIDs, userID)
	}

	// update the score for each user who guessed correctly.
	for _, userID := range userIDs {
		updateQuery := `UPDATE users SET score = score + 100 WHERE id = $1`
		if _, err := tx.Exec(updateQuery, userID); err != nil {
			return fmt.Errorf("failed to update score for user %d: %w", userID, err)
		}
	}

	// mark the game round as played.
	updateRoundQuery := `UPDATE game_rounds SET played = TRUE WHERE id = $1`
	if _, err := tx.Exec(updateRoundQuery, roundID); err != nil {
		return fmt.Errorf("failed to mark round %d as played: %w", roundID, err)
	}

	// commit transaction.
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
