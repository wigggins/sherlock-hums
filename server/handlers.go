package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// Request payload for creating a session
type CreateSessionRequest struct {
	HostUsername string `json:"host_username"`
}

// Response payload for creating a session
type CreateSessionResponse struct {
	SessionID string `json:"session_id"`
}

// createSessionHandler creates a new session and a host user
func createSessionHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the request
	var req CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Create the host user first
	hostUserID, err := createUser(req.HostUsername, nil) // sessionID empty at first
	if err != nil {
		http.Error(w, "Error creating host user", http.StatusInternalServerError)
		return
	}

	// Generate a unique 6-character session ID (you might use a better generator)
	sessionID := generateSessionID()

	// Create session with host_id set to hostUserID
	if err := createSession(sessionID, hostUserID); err != nil {
		http.Error(w, "Error creating session", http.StatusInternalServerError)
		return
	}

	// Update the host user with the session ID
	if err := updateUserSession(hostUserID, sessionID); err != nil {
		http.Error(w, "Error updating host user", http.StatusInternalServerError)
		return
	}

	resp := CreateSessionResponse{SessionID: sessionID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// joinSessionRequest represents the request to join a session
type JoinSessionRequest struct {
	SessionID string `json:"session_id"`
	Username  string `json:"username"`
}

// joinSessionHandler allows a user to join an existing session
func joinSessionHandler(w http.ResponseWriter, r *http.Request) {
	var req JoinSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate that session exists
	exists, err := sessionExists(req.SessionID)
	if err != nil || !exists {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	// Create the user
	if _, err := createUser(req.Username, &req.SessionID); err != nil {
		http.Error(w, "Error joining session", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Joined session successfully"))
}

// Request payload for song submission
type SongSubmissionRequest struct {
	UserID int      `json:"user_id"`
	Songs  []string `json:"songs"`
}

// Response payload for song submission
type SongSubmissionResponse struct {
	Message string `json:"message"`
}

func submitSongsHandler(w http.ResponseWriter, r *http.Request) {
	var req SongSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate the input: exactly 3 songs required
	if len(req.Songs) != 3 {
		http.Error(w, "Exactly 3 songs must be submitted", http.StatusBadRequest)
		return
	}

	// Get sessionID from URL path parameter
	vars := mux.Vars(r)
	sessionID, ok := vars["sessionID"]
	if !ok || sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	// Validate that the user belongs to the session
	userSessionID, err := getUserSession(req.UserID)
	if err != nil {
		http.Error(w, "Error retrieving user session", http.StatusInternalServerError)
		return
	}
	if userSessionID != sessionID {
		http.Error(w, "User does not belong to this session", http.StatusForbidden)
		return
	}

	// TODO: validate each song URL here

	// insert each song submission into the database
	for idx, songURL := range req.Songs {
		// TODO: change how i'm setting song order..
		// needs to be set once all songs submitted by all users
		if err := createSongSubmission(req.UserID, sessionID, songURL, idx+1); err != nil {
			http.Error(w, "Error submitting song: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	resp := SongSubmissionResponse{Message: "Songs submitted successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
