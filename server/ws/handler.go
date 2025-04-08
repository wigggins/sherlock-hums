package ws

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// TODO: fix this up so its locked down
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	sessionID := r.URL.Query().Get("sessionID")
	log.Printf("New WebSocket connection from %v for sessionID=%s", conn.RemoteAddr(), sessionID)

	client := &Client{
		hub:       hub,
		conn:      conn,
		send:      make(chan Message, 256),
		SessionID: sessionID,
	}
	hub.register <- client

	go client.writePump()
	go client.readPump()
}
