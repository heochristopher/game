// File: src/game/scenes/Game.ts
import { Scene } from "phaser";
import { Client } from "../Client";
import { EventBus } from "../EventBus";

export class Game extends Scene {
    public static instance: Game;

    private camera: Phaser.Cameras.Scene2D.Camera;
    private client: Client;
    private players: { [id: string]: Phaser.GameObjects.Sprite } = {};
    private playerId: string = "";
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    // Map dimensions for bounds checking.
    private mapWidth: number;
    private mapHeight: number;

    // Flag and tween to manage local movement.
    private localMoving: boolean = false;
    private localTween: Phaser.Tweens.Tween | null = null;

    // Movement step (in pixels) and tween duration (in ms).
    private moveStep: number = 20;
    private tweenDuration: number = 200;

    constructor() {
        super("Game");
        Game.instance = this;
    }

    create() {
        // Initialize the WebSocket client.
        this.client = new Client(
            "wss://websockets-server-kqfuh.ondigitalocean.app/ws"
        );

        // Create the tilemap and its layers.
        const tilemap = this.make.tilemap({ key: "game" });
        tilemap.addTilesetImage("spritesheet", "spritesheet");
        for (let i = 0; i < tilemap.layers.length; i++) {
            tilemap.createLayer(i, "spritesheet", 0, 0);
        }

        const interactivesLayer = tilemap.getLayer("Interactives")!.tilemapLayer
        interactivesLayer.setInteractive()
        interactivesLayer.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            window.dispatchEvent(new CustomEvent("openEditor"));
        });

        // Store map dimensions.
        this.mapWidth = tilemap.widthInPixels;
        this.mapHeight = tilemap.heightInPixels;

        // Set up the camera.
        this.camera = this.cameras.main;
        this.cameras.main.setZoom(1.5);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);

        // Create animations for the "snowman" sprite.
        this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("snowman", {
                start: 0,
                end: 2,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "walk-left",
            frames: this.anims.generateFrameNumbers("snowman", {
                start: 3,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("snowman", {
                start: 6,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNumbers("snowman", {
                start: 9,
                end: 11,
            }),
            frameRate: 10,
            repeat: -1,
        });

        // Set up keyboard input.
        this.cursors = this.input.keyboard.createCursorKeys();

        // Notify other parts of the app that the scene is ready.
        EventBus.emit("current-scene-ready", this);
    }

    // Spawn a new player (local or remote).
    public spawnPlayer(id: string, x: number, y: number) {
        console.log("Spawning player", id, "at", x, y);
        if (this.players[id]) return; // Already exists.

        const playerSprite = this.add.sprite(x, y, "snowman");
        playerSprite.setDepth(10); // Ensure it renders above other elements.
        this.players[id] = playerSprite;
        console.log(
            `Sprite for ${id} added at (${playerSprite.x}, ${playerSprite.y})`
        );

        // If this is the local player, start following.
        if (id === this.playerId) {
            this.cameras.main.startFollow(playerSprite, true);
            console.log(`Local player spawned at (${x}, ${y})`);
        } else {
            console.log(`Remote player ${id} spawned at (${x}, ${y})`);
        }
    }

    // Update loop for the local player.
    update() {
        if (!this.playerId) return; // Wait until local player ID is set.
        const localSprite = this.players[this.playerId];
        if (!localSprite) return;

        // If no movement key is held, do nothing (let current tween finish).
        if (
            !this.cursors.left.isDown &&
            !this.cursors.right.isDown &&
            !this.cursors.up.isDown &&
            !this.cursors.down.isDown
        ) {
            return;
        }

        // If a move is already in progress, do not send another command.
        if (this.localMoving) return;

        let direction = "";
        let dx = 0,
            dy = 0;
        if (this.cursors.left.isDown) {
            direction = "left";
            dx = -this.moveStep;
        } else if (this.cursors.right.isDown) {
            direction = "right";
            dx = this.moveStep;
        } else if (this.cursors.up.isDown) {
            direction = "up";
            dy = -this.moveStep;
        } else if (this.cursors.down.isDown) {
            direction = "down";
            dy = this.moveStep;
        }

        if (direction) {
            // Calculate tentative new position and clamp it within bounds.
            const newX = Phaser.Math.Clamp(
                localSprite.x + dx,
                0,
                this.mapWidth - localSprite.width
            );
            const newY = Phaser.Math.Clamp(
                localSprite.y + dy,
                0,
                this.mapHeight - localSprite.height
            );

            // Only send a move command if the position would change.
            if (newX !== localSprite.x || newY !== localSprite.y) {
                this.client.sendMove(direction);
                this.localMoving = true;
            }
        }
    }

    // Update a player's position when a "playerMoved" message is received.
    public updateOtherPlayer(id: string, targetX: number, targetY: number) {
        if (!this.players[id]) {
            this.spawnPlayer(id, targetX, targetY);
            return;
        }

        const sprite = this.players[id];

        // Determine the move direction from the current position to the target.
        const dx = targetX - sprite.x;
        const dy = targetY - sprite.y;
        let moveDirection = "";
        if (Math.abs(dx) > Math.abs(dy)) {
            moveDirection = dx < 0 ? "left" : "right";
        } else {
            moveDirection = dy < 0 ? "up" : "down";
        }

        // Play the corresponding animation.
        if (moveDirection === "left") {
            sprite.anims.play("walk-left", true);
        } else if (moveDirection === "right") {
            sprite.anims.play("walk-right", true);
        } else if (moveDirection === "up") {
            sprite.anims.play("walk-up", true);
        } else if (moveDirection === "down") {
            sprite.anims.play("walk-down", true);
        }

        // Clamp the target position.
        const clampedX = Phaser.Math.Clamp(
            targetX,
            0,
            this.mapWidth - sprite.width
        );
        const clampedY = Phaser.Math.Clamp(
            targetY,
            0,
            this.mapHeight - sprite.height
        );

        // Create a tween for movement with the desired duration.
        const tween = this.tweens.add({
            targets: sprite,
            x: clampedX,
            y: clampedY,
            duration: this.tweenDuration,
            ease: "Linear",
            onComplete: () => {
                sprite.anims.stop();
                // Always clear the local moving flag so update() can send another move command.
                if (id === this.playerId) {
                    this.localMoving = false;
                    this.localTween = null;
                }
            },
        });

        // If this tween is for the local player, store it.
        if (id === this.playerId) {
            this.localTween = tween;
        }
    }

    // Remove a player when a "playerLeft" message is received.
    public removePlayer(id: string) {
        if (this.players[id]) {
            this.players[id].destroy();
            delete this.players[id];
            console.log(`Removed player ${id}`);
        }
    }

    // Set the local player ID (called by Client.ts upon receiving a "setPlayerId" message).
    public setLocalPlayerId(id: string) {
        this.playerId = id;
        console.log("Local player ID set to:", id);
    }
}



