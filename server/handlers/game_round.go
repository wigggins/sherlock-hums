package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/store"
	"github.com/wigggins/sherlock-hums/server/ws"
)

func StartSubmissionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionID"]
	if sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	// TODO: add additional validation, only the host can call this endpoint

	if err := store.UpdateSessionState(sessionID, "SUBMISSION"); err != nil {
		http.Error(w, "Error updating session state: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// broadcast a "game_started" message to all clients in the session
	ws.HubInstance.Broadcast(nil, "game_started", sessionID)

	resp := StartGameResponse{
		Message: "Game started; transitioning to song submission",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type StartGameResponse struct {
	Message string `json:"message"`
}

func StartGuessingHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID, ok := vars["sessionID"]
	if !ok || sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	// create game rounds
	err := store.CreateGameRounds(sessionID)
	if err != nil {
		http.Error(w, "Error creating game rounds: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// update the session state to GUESSING
	err = store.UpdateSessionState(sessionID, "GUESSING")
	if err != nil {
		http.Error(w, "Error updating session state: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := StartGameResponse{Message: "Game rounds created and session state updated to GUESSING successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)

	ws.HubInstance.Broadcast(nil, "guessing_started", sessionID)
}

// TODO: think about 'current round' validation
// prevent users from retrieving future rounds, etc
func GetRoundHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID, ok := vars["sessionID"]
	roundIDStr := vars["roundID"]

	roundID, err := strconv.Atoi(roundIDStr)
	if err != nil {
		http.Error(w, "Invalid round ID", http.StatusBadRequest)
		return
	}

	if !ok || sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	round, err := store.GetRound(roundID, sessionID)
	if err != nil {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(round)
}

type RoundCompleteResponse struct {
	Message string `json:"message"`
}

// CompleteRoundHandler finalizes a round by calculating scores and marking it as played
func CompleteRoundHandler(w http.ResponseWriter, r *http.Request) {
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

	// process round completion
	err = store.CompleteRound(roundID)
	if err != nil {
		http.Error(w, "Error completing round: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := RoundCompleteResponse{Message: "Round completed and scores updated successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
