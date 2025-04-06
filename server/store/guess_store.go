package store

import (
	"fmt"
)

// CreateGuess submits a guess for a given round.
// it retrieves the correct submitter from the game_round joined with song_submissions,
// compares it with the guessedUserID, and records the guess along with correctness.
func CreateGuess(roundID, userID, guessedUserID int) error {
	// retrieve the correct submitter for the round.
	var correctSubmitter int
	query := `
		SELECT s.user_id
		FROM game_rounds gr
		JOIN song_submissions s ON gr.song_submission_id = s.id
		WHERE gr.id = $1
	`
	err := db.QueryRow(query, roundID).Scan(&correctSubmitter)
	if err != nil {
		return fmt.Errorf("failed to retrieve correct submitter: %w", err)
	}

	// determine whether the guess is correct.
	correct := guessedUserID == correctSubmitter

	// insert the guess into the guesses table.
	insertQuery := `
		INSERT INTO guesses (round_id, user_id, guessed_user_id, correct)
		VALUES ($1, $2, $3, $4)
	`
	_, err = db.Exec(insertQuery, roundID, userID, guessedUserID, correct)
	if err != nil {
		return fmt.Errorf("failed to insert guess: %w", err)
	}
	return nil
}
