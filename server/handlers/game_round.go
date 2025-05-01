package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

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

// StartRoundRequest is the payload from the client.
type StartRoundRequest struct {
	UserID int `json:"user_id"` // caller’s user ID
}

func StartRoundHandler(w http.ResponseWriter, r *http.Request) {
	var req StartRoundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	vars := mux.Vars(r)
	sessionID := vars["sessionID"]
	roundIDStr := vars["roundID"]
	roundID, err := strconv.Atoi(roundIDStr)
	if err != nil {
		http.Error(w, "Invalid round ID", http.StatusBadRequest)
		return
	}

	// verify caller is the session host.
	hostID, err := store.GetSessionHost(sessionID)
	if err != nil {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}
	if req.UserID != hostID {
		http.Error(w, "Only the host may start a round", http.StatusForbidden)
		return
	}

	// fetch the round data to send to clients.
	roundData, err := store.GetRoundByNumber(sessionID, roundID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching round: %v", err), http.StatusInternalServerError)
		return
	}

	// broadcast the "round_started" event to all clients in this session.
	ws.HubInstance.Broadcast(roundData, "round_started", sessionID)

	go startRoundTimer(sessionID, roundData.RoundID, roundData.RoundNumber, 60*time.Second)

	resp := RoundStartedResponse{Message: "Round started successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type RoundStartedResponse struct {
	Message string `json:"message"`
}

func startRoundTimer(sessionID string, roundID int, roundNumber int, duration time.Duration) {
	// wait for the full duration
	time.Sleep(duration)

	// todo: maybe check to ensure round hasn't been completed yet
	err := store.CompleteRound(roundID)
	if err != nil {
		return
	}

	// get voting results and tally scores
	results, err := store.GetRoundResults(sessionID, roundID)
	if err != nil {
		ws.HubInstance.Broadcast(map[string]string{"error": err.Error()}, "round_complete_error", sessionID)
		return
	}

	nextNum, hasNext, err := store.HasNextRound(sessionID, roundNumber)
	if err != nil {
		// handle error…
		log.Printf("[Timer] HasNextRound error: %v\n", err)
		return
	}
	log.Printf("[Timer] HasNextRound returned nextNum=%d, hasNext=%v\n", nextNum, hasNext)

	if !hasNext {
		log.Printf("[Timer] No more rounds—game complete for session %q\n", sessionID)
		results.GameComplete = true
	}

	// Broadcast round completion and results over WebSocket.
	ws.HubInstance.Broadcast(results, "round_completed", sessionID)
}
