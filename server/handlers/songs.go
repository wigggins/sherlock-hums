package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/store"
	"github.com/wigggins/sherlock-hums/server/ws"
)

type SongSubmissionRequest struct {
	UserID int      `json:"user_id"`
	Songs  []string `json:"songs"`
}

type SongSubmissionResponse struct {
	Message string `json:"message"`
}

func SubmitSongsHandler(w http.ResponseWriter, r *http.Request) {
	var req SongSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// validate the input: exactly 3 songs required
	// if len(req.Songs) != 3 {
	// 	http.Error(w, "Exactly 3 songs must be submitted", http.StatusBadRequest)
	// 	return
	// }

	// get sessionID from URL path parameter
	vars := mux.Vars(r)
	sessionID, ok := vars["sessionID"]
	if !ok || sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusBadRequest)
		return
	}

	// validate that the user belongs to the session
	userSessionID, err := store.GetUserSession(req.UserID)
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
		if err := store.CreateSongSubmission(req.UserID, sessionID, songURL, idx+1); err != nil {
			http.Error(w, "Error submitting song: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// broadcast a 'submission_completed' once a user submits their songs
	newSubmission := struct {
		UserID int    `json:"user_id"`
		Status string `json:"status"`
	}{
		UserID: req.UserID,
		Status: "submitted",
	}

	ws.HubInstance.Broadcast(newSubmission, "submission_completed", sessionID)

	resp := SongSubmissionResponse{Message: "Songs submitted successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
