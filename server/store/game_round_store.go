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

func GetSongSubmissions(sessionID string) ([]struct {
	ID int
}, error) {
	query := `SELECT id FROM song_submissions WHERE session_id = $1`
	rows, err := db.Query(query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []struct{ ID int }
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		submissions = append(submissions, struct{ ID int }{ID: id})
	}
	return submissions, nil
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
