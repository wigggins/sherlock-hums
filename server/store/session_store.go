package store

func CreateSession(sessionID string, hostID int) error {
	query := `INSERT INTO sessions (id, host_id, state) VALUES ($1, $2, 'WAITING')`
	_, err := db.Exec(query, sessionID, hostID)
	return err
}

func SessionExists(sessionID string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM sessions WHERE id = $1)`
	err := db.QueryRow(query, sessionID).Scan(&exists)
	return exists, err
}
