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

type Round struct {
	RoundID     int    `json:"round_id"`
	SessionID   string `json:"session_id"`
	RoundNumber int    `json:"round_number"`
	// todo: probably change this to just song id soon
	SongURL string `json:"song_url"`
	Played  bool   `json:"played"`
}

// todo get rid of this since roundID is shielded from UI
func GetRound(roundID int, sessionID string) (*Round, error) {
	query := `
		SELECT gr.id, gr.session_id, gr.round_number, s.song_url, gr.played
		FROM game_rounds gr
		JOIN song_submissions s ON gr.song_submission_id = s.id
		WHERE gr.id = $1 AND gr.session_id = $2
	`
	var round Round
	err := db.QueryRow(query, roundID, sessionID).Scan(
		&round.RoundID, &round.SessionID, &round.RoundNumber, &round.SongURL, &round.Played,
	)
	if err != nil {
		return nil, err
	}
	return &round, nil
}

// GetRoundByNumber looks up the Round for a given session and round_number.
func GetRoundByNumber(sessionID string, roundNumber int) (*Round, error) {
	const q = `
		SELECT gr.id, gr.session_id, gr.round_number, s.song_url, gr.played
		FROM game_rounds gr
		JOIN song_submissions s
			ON gr.song_submission_id = s.id
		WHERE gr.session_id = $1
			AND gr.round_number = $2
		LIMIT 1
	`
	var r Round
	err := db.QueryRow(q, sessionID, roundNumber).
		Scan(&r.RoundID, &r.SessionID, &r.RoundNumber, &r.SongURL, &r.Played)
	if err != nil {
		return nil, err
	}
	return &r, nil
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

// todo: probably move these and audit to prevent dupes
type User struct {
	ID       int    `json:"user_id"`
	Username string `json:"username"`
}

type PlayerScore struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Score    int    `json:"score"`
}

type RoundResults struct {
	CorrectUser User          `json:"correctUser"`
	Scores      []PlayerScore `json:"scores"`
}

func GetRoundResults(sessionID string, roundID int) (*RoundResults, error) {
	// who submitted this round?
	var correctUser User
	if err := db.QueryRow(`
			SELECT u.id, u.username
			FROM game_rounds gr
			JOIN song_submissions s ON gr.song_submission_id = s.id
			JOIN users u ON s.user_id = u.id
			WHERE gr.id = $1 AND gr.session_id = $2
	`, roundID, sessionID).Scan(&correctUser.ID, &correctUser.Username); err != nil {
		return nil, fmt.Errorf("fetching correct user: %w", err)
	}

	// pull each user's stored score
	rows, err := db.Query(`
			SELECT id, username, score
			FROM users
			WHERE session_id = $1
			ORDER BY username
	`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("querying stored scores: %w", err)
	}
	defer rows.Close()

	var scores []PlayerScore
	for rows.Next() {
		var ps PlayerScore
		if err := rows.Scan(&ps.UserID, &ps.Username, &ps.Score); err != nil {
			return nil, fmt.Errorf("scanning score row: %w", err)
		}
		scores = append(scores, ps)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating score rows: %w", err)
	}

	return &RoundResults{
		CorrectUser: correctUser,
		Scores:      scores,
	}, nil
}
