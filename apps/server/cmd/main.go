package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Player represents a connected player
type Player struct {
	ID   string
	X    int
	Y    int
	Conn *websocket.Conn
}

var upgrader = websocket.Upgrader{
	// Allow connections from any origin (adjust as needed)
	CheckOrigin: func(r *http.Request) bool { return true },
}

var (
	players      = make(map[string]*Player)
	playersMutex sync.Mutex
)

// broadcastMessage sends a JSON message to all connected players.
func broadcastMessage(message map[string]interface{}) {
	playersMutex.Lock()
	defer playersMutex.Unlock()

	for id, p := range players {
		err := p.Conn.WriteJSON(message)
		if err != nil {
			log.Printf("Error sending message to player %s: %v", id, err)
			p.Conn.Close()
			delete(players, id)
		}
	}
}

// broadcastExcept sends a JSON message to all players except the one with excludeID.
func broadcastExcept(message map[string]interface{}, excludeID string) {
	playersMutex.Lock()
	defer playersMutex.Unlock()

	for id, p := range players {
		if id == excludeID {
			continue
		}
		err := p.Conn.WriteJSON(message)
		if err != nil {
			log.Printf("Error sending message to player %s: %v", id, err)
			p.Conn.Close()
			delete(players, id)
		}
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	// Create a new player (using a simple incremental ID)
	playerID := fmt.Sprintf("player-%d", len(players)+1)
	newPlayer := &Player{
		ID:   playerID,
		X:    100 + len(players)*50, // Offset each player slightly
		Y:    100 + len(players)*50,
		Conn: conn,
	}

	// Lock and capture existing players (excluding the new one)
	playersMutex.Lock()
	// Add the new player immediately
	players[playerID] = newPlayer

	// Send a message to the new client to set its own ID
	if err := conn.WriteJSON(map[string]interface{}{
		"type": "setPlayerId",
		"id":   playerID,
		"x":    newPlayer.X,
		"y":    newPlayer.Y,
	}); err != nil {
		log.Printf("Error sending setPlayerId message: %v", err)
		playersMutex.Unlock()
		return
	}

	// Build the full list of all players (including the new one)
	allPlayers := make([]map[string]interface{}, 0, len(players))
	for _, p := range players {
		allPlayers = append(allPlayers, map[string]interface{}{
			"id": p.ID,
			"x":  p.X,
			"y":  p.Y,
		})
	}

	playersMutex.Unlock()

	// Now send the "allplayers" message
	if err := conn.WriteJSON(map[string]interface{}{
		"type":    "allplayers",
		"players": allPlayers,
	}); err != nil {
		log.Printf("Error sending allplayers message: %v", err)
		return
	}

	// Notify all other clients about the new player ("newplayer" event)
	broadcastExcept(map[string]interface{}{
		"type": "newplayer",
		"id":   newPlayer.ID,
		"x":    newPlayer.X,
		"y":    newPlayer.Y,
	}, newPlayer.ID)

	log.Printf("New player connected: %s", playerID)

	// Listen for incoming messages from the client
	for {
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("Error reading WebSocket message: %v", err)
			break
		}

		// Process a "move" message sent by the client
		if msg["type"] == "move" {
			direction, ok := msg["direction"].(string)
			if !ok {
				continue
			}

			playersMutex.Lock()
			switch direction {
			case "left":
				newPlayer.X -= 10
			case "right":
				newPlayer.X += 10
			case "up":
				newPlayer.Y -= 10
			case "down":
				newPlayer.Y += 10
			}
			playersMutex.Unlock()

			// Broadcast the updated position to all clients
			broadcastMessage(map[string]interface{}{
				"type": "playerMoved",
				"id":   newPlayer.ID,
				"x":    newPlayer.X,
				"y":    newPlayer.Y,
			})
		}
	}

	// When the loop ends (i.e. connection lost), remove the player and broadcast a "playerLeft" event
	playersMutex.Lock()
	delete(players, newPlayer.ID)
	playersMutex.Unlock()
	broadcastMessage(map[string]interface{}{
		"type": "playerLeft",
		"id":   newPlayer.ID,
	})
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	log.Println("Server started on ws://localhost:8081/ws")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
