package main

import (
	"log"
	"net/http"
	"os"

	corsHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/wigggins/sherlock-hums/server/handlers"
	"github.com/wigggins/sherlock-hums/server/store"
	"github.com/wigggins/sherlock-hums/server/ws"
)

func main() {
	// initialize database connection (see db.go for details)
	err := store.InitDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer store.CloseDB()

	// Initialize the WebSocket hub and start its run loop.
	hub := ws.HubInstance
	go hub.Run()

	r := mux.NewRouter()

	// session and user Endpoints
	r.HandleFunc("/session", handlers.CreateSessionHandler).Methods("POST")
	r.HandleFunc("/session/join", handlers.JoinSessionHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/songs", handlers.SubmitSongsHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/players", handlers.GetPlayersHandler).Methods("GET")

	// game round management
	r.HandleFunc("/session/{sessionID}/start/submission", handlers.StartSubmissionHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/start/guessing", handlers.StartGuessingHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/round/{roundID}", handlers.StartRoundHandler).Methods("POST")
	r.HandleFunc("/session/{sessionID}/round/{roundID}/guess", handlers.SubmitGuessHandler).Methods("POST")

	r.HandleFunc("/session/scores", handlers.GetScoresHandler).Methods("GET")

	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWs(hub, w, r)
	})

	// Set up CORS middleware to allow your client origin.
	allowedOrigins := corsHandlers.AllowedOrigins([]string{"*"})
	allowedMethods := corsHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := corsHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	log.Println("Server running on port 8080")
	if err := http.ListenAndServe(":8080", corsHandlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r)); err != nil {
		log.Fatal(err)
	}
}
