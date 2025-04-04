package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize database connection (see db.go for details)
	err := initDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer closeDB()

	// Set up router using gorilla/mux
	r := mux.NewRouter()

	// Session and User Endpoints
	r.HandleFunc("/session", createSessionHandler).Methods("POST")
	r.HandleFunc("/session/join", joinSessionHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/songs", submitSongsHandler).Methods("POST")

	// Additional endpoints (for song submission, etc.) would be added here

	log.Println("Server running on port 8080")
	http.ListenAndServe(":8080", r)
}
