package handlers

import (
	"encoding/json"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/wigggins/sherlock-hums/server/store"
)

type UserScore struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Score    int    `json:"score"`
}

// GetScoresHandler returns the current scores for all users in a session.
func GetScoresHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
	if sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	scores, err := store.GetScores(sessionID)
	if err != nil {
		http.Error(w, "Error fetching scores: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scores)
}
