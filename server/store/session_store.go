package store

import "fmt"

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

// UpdateSessionState updates the state of the session to the given newState.
func UpdateSessionState(sessionID, newState string) error {
	query := `UPDATE sessions SET state = $1, updated_at = NOW() WHERE id = $2`
	_, err := db.Exec(query, newState, sessionID)
	if err != nil {
		return fmt.Errorf("failed to update session state: %w", err)
	}
	return nil
}
