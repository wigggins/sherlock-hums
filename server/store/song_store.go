package store

func CreateSongSubmission(userID int, sessionID, songURL string, submissionOrder int) error {
	query := `
		INSERT INTO song_submissions (user_id, session_id, song_url, submission_order)
		VALUES ($1, $2, $3, $4)
	`
	_, err := db.Exec(query, userID, sessionID, songURL, submissionOrder)
	return err
}
