package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/handlers"
	"github.com/wigggins/sherlock-hums/server/store"
)

func main() {
	// Initialize database connection (see db.go for details)
	err := store.InitDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer store.CloseDB()

	// Set up router using gorilla/mux
	r := mux.NewRouter()

	// Session and User Endpoints
	r.HandleFunc("/session", handlers.CreateSessionHandler).Methods("POST")
	r.HandleFunc("/session/join", handlers.JoinSessionHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/songs", handlers.SubmitSongsHandler).Methods("POST")

	// Additional endpoints (for song submission, etc.) would be added here

	log.Println("Server running on port 8080")
	http.ListenAndServe(":8080", r)
}
