package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/store"
)

type StartGameResponse struct {
	Message string `json:"message"`
}

func StartGameHandler(w http.ResponseWriter, r *http.Request) {
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
}
