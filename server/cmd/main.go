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
	// initialize database connection (see db.go for details)
	err := store.InitDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer store.CloseDB()

	r := mux.NewRouter()

	// session and user Endpoints
	r.HandleFunc("/session", handlers.CreateSessionHandler).Methods("POST")
	r.HandleFunc("/session/join", handlers.JoinSessionHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/songs", handlers.SubmitSongsHandler).Methods("POST")

	// game round management
	r.HandleFunc("/session/{sessionID}/start", handlers.StartGameHandler).Methods("POST")

	log.Println("Server running on port 8080")
	http.ListenAndServe(":8080", r)
}
