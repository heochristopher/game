// File: src/game/Client.ts

import { Game } from "./scenes/Game";

export class Client {
    private socket: WebSocket;

    constructor(url: string) {
        // Create a WebSocket connection
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("Connected to server");
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log("Disconnected from server");
        };
    }
    private handleMessage(data: any) {
        console.log("message received: ", data);
        switch (data.type) {
            case "setPlayerId":
                Game.instance.setLocalPlayerId(data.id);
                Game.instance.spawnPlayer(data.id, data.x, data.y);
                break;
            case "allplayers":
                const players = data.players || [];
                players.forEach((p: any) => {
                    Game.instance.spawnPlayer(p.id, p.x, p.y);
                });
                break;
            case "newplayer":
                Game.instance.spawnPlayer(data.id, data.x, data.y);
                break;
            case "playerMoved":
                Game.instance.updateOtherPlayer(data.id, data.x, data.y);
                break;
            case "playerLeft":
                Game.instance.removePlayer(data.id);
                break;
            default:
                console.log("Unhandled message type:", data.type);
        }
    }

    // Example of how to send a movement message to the server
    public sendMove(direction: string) {
        this.socket.send(
            JSON.stringify({
                type: "move",
                direction,
            })
        );
    }

    public isOpen(): boolean {
        return this.socket.readyState === WebSocket.OPEN;
    }

}