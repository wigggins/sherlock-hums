package ws

import (
	"log"
	"sync"
)

type Message struct {
	Event     string      `json:"event"`
	Data      interface{} `json:"data"`
	SessionID string      `json:"session_id,omitempty"`
}

// hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

var HubInstance = NewHub()

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client registered: %v (Session: %s)", client.conn.RemoteAddr(), client.SessionID)
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered: %v (Session: %s)", client.conn.RemoteAddr(), client.SessionID)
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.Lock()
			log.Printf("Broadcasting message: event=%s to session=%s", message.Event, message.SessionID)
			for client := range h.clients {
				// Filter by session ID if specified.
				if message.SessionID != "" && client.SessionID != message.SessionID {
					continue
				}
				select {
				case client.send <- message:
					log.Printf("Message delivered to %v (Session: %s)", client.conn.RemoteAddr(), client.SessionID)
				default:
					close(client.send)
					delete(h.clients, client)
					log.Printf("Dropped client: %v (Session: %s)", client.conn.RemoteAddr(), client.SessionID)
				}
			}
			h.mu.Unlock()
		}
	}
}

// exported method to send a message via the Hub.
func (h *Hub) Broadcast(data interface{}, event, sessionID string) {
	h.broadcast <- Message{
		Event:     event,
		Data:      data,
		SessionID: sessionID,
	}
}
