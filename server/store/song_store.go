package store

func CreateSongSubmission(userID int, sessionID, songURL string, submissionOrder int) error {
	query := `
		INSERT INTO song_submissions (user_id, session_id, song_url, submission_order)
		VALUES ($1, $2, $3, $4)
	`
	_, err := db.Exec(query, userID, sessionID, songURL, submissionOrder)
	return err
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
