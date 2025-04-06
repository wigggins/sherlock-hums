package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/store"
)

type GuessSubmissionRequest struct {
	UserID        int `json:"user_id"`
	GuessedUserID int `json:"guessed_user_id"`
}

type GuessSubmissionResponse struct {
	Message string `json:"message"`
}

func SubmitGuessHandler(w http.ResponseWriter, r *http.Request) {
	// retrieve sessionID and roundID from URL parameters.
	vars := mux.Vars(r)
	sessionID := vars["sessionID"]
	roundIDStr := vars["roundID"]
	if sessionID == "" || roundIDStr == "" {
		http.Error(w, "Session ID and Round ID are required", http.StatusBadRequest)
		return
	}

	roundID, err := strconv.Atoi(roundIDStr)
	if err != nil {
		http.Error(w, "Invalid Round ID", http.StatusBadRequest)
		return
	}

	// decode the request body.
	var req GuessSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// (TODO) validate that the user belongs to the session.
	// this could be done by checking the user's session from the database.

	// process the guess submission.
	err = store.CreateGuess(roundID, req.UserID, req.GuessedUserID)
	if err != nil {
		http.Error(w, "Error submitting guess: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := GuessSubmissionResponse{Message: "Guess submitted successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
