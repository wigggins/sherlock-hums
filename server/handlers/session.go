package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/store"
	"github.com/wigggins/sherlock-hums/server/ws"
)

type CreateSessionRequest struct {
	HostUsername string `json:"host_username"`
	AvatarColor  string `json:"avatar_color"`
	AvatarType   string `json:"avatar_type"`
}

type CreateSessionResponse struct {
	SessionID string `json:"session_id"`
	UserID    int    `json:"user_id"`
}

// generateSessionID creates a random 6-character alphanumeric string
func generateSessionID() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var seededRand = rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// createSessionHandler creates a new session and a host user
func CreateSessionHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// create the host user first
	hostUserID, err := store.CreateUser(req.HostUsername, nil, req.AvatarType, req.AvatarColor) // sessionID empty at first
	if err != nil {
		http.Error(w, "Error creating host user", http.StatusInternalServerError)
		return
	}

	// generate a unique 6-character session ID
	sessionID := generateSessionID()

	// create session with host_id set to hostUserID
	if err := store.CreateSession(sessionID, hostUserID); err != nil {
		http.Error(w, "Error creating session", http.StatusInternalServerError)
		return
	}

	// update the host user with the session ID
	if err := store.UpdateUserSession(hostUserID, sessionID); err != nil {
		http.Error(w, "Error updating host user", http.StatusInternalServerError)
		return
	}

	resp := CreateSessionResponse{SessionID: sessionID, UserID: hostUserID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type JoinSessionRequest struct {
	SessionID   string `json:"session_id"`
	Username    string `json:"username"`
	AvatarColor string `json:"avatar_color"`
	AvatarType  string `json:"avatar_type"`
}

type JoinSessionResponse struct {
	SessionID string `json:"session_id"`
	UserID    int    `json:"user_id"`
}

// joinSessionHandler allows a user to join an existing session
func JoinSessionHandler(w http.ResponseWriter, r *http.Request) {
	var req JoinSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// validate that session exists
	exists, err := store.SessionExists(req.SessionID)
	if err != nil || !exists {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	// create the user
	createdUserID, err := store.CreateUser(req.Username, &req.SessionID, req.AvatarType, req.AvatarColor)
	if err != nil {
		http.Error(w, "Error joining session", http.StatusInternalServerError)
		return
	}

	newPlayer := struct {
		UserID      int    `json:"user_id"`
		Username    string `json:"username"`
		SessionID   string `json:"session_id"`
		AvatarColor string `json:"avatar_color"`
	}{
		UserID:      createdUserID,
		Username:    req.Username,
		SessionID:   req.SessionID,
		AvatarColor: req.AvatarColor,
	}

	ws.HubInstance.Broadcast(newPlayer, "player_joined", req.SessionID)

	resp := JoinSessionResponse{SessionID: req.SessionID, UserID: createdUserID}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetPlayersHandler retrieves the current players for a session.
func GetPlayersHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionID"]
	if sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	players, err := store.GetPlayersBySession(sessionID)
	if err != nil {
		http.Error(w, "Error retrieving players: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

type CompleteGameRequest struct {
	UserID int `json:"user_id"`
}

func CompleteGameHandler(w http.ResponseWriter, r *http.Request) {
	var req CompleteGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	sessionID := mux.Vars(r)["sessionID"]

	// only host may complete the game
	hostID, err := store.GetSessionHost(sessionID)
	if err != nil {
		http.Error(w, "Error verifying session", http.StatusInternalServerError)
		return
	}
	if req.UserID != hostID {
		http.Error(w, "Only the host may complete the game", http.StatusForbidden)
		return
	}

	// ensure every round has been played
	allPlayed, err := store.AllRoundsPlayed(sessionID)
	if err != nil {
		http.Error(w, "Error checking rounds", http.StatusInternalServerError)
		return
	}
	if !allPlayed {
		http.Error(w, "Not all rounds have been played", http.StatusBadRequest)
		return
	}

	// mark session COMPLETE
	if err := store.UpdateSessionState(sessionID, "COMPLETE"); err != nil {
		http.Error(w, "Error updating session state", http.StatusInternalServerError)
		return
	}
	// todo: maybe broadcast final scores?
	ws.HubInstance.Broadcast(nil, "final_results", sessionID)

	// respond success for http call
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "game_completed",
	})
}
