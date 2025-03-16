import { Direction, GridEngine, NumberOfDirections } from "grid-engine";
import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Client } from "../Client";

export class Game extends Scene {
    public static instance: Game;

    private camera: Phaser.Cameras.Scene2D.Camera;
    private gridEngine!: GridEngine;
    private client: Client;
    private players: { [id: string]: Phaser.GameObjects.Sprite } = {};
    private playerId: string = "";

    constructor() {
        super("Game");
        Game.instance = this;
    }

    create() {
        this.client = new Client("ws://localhost:8081/ws");

        const tilemap = this.make.tilemap({ key: "game" });
        tilemap.addTilesetImage("spritesheet", "spritesheet");

        for (let i = 0; i < tilemap.layers.length; i++) {
            tilemap.createLayer(i, "spritesheet", 0, 0);
        }

        this.camera = this.cameras.main;
        this.cameras.main.setZoom(1.5);
        this.cameras.main.setBounds(
            0,
            0,
            tilemap.widthInPixels,
            tilemap.heightInPixels
        );

        const playerSprite = this.add.sprite(0, 0, "snowman");
        this.cameras.main.startFollow(playerSprite, true);
        this.cameras.main.setFollowOffset(
            -playerSprite.width / 2,
            -playerSprite.height / 2
        );

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

        const gridEngineConfig = {
            characters: [
                // {
                //     id: "snowman",
                //     sprite: playerSprite,
                //     walkingAnimationMapping: {
                //         up: { leftFoot: 6, standing: 7, rightFoot: 8 },
                //         down: { leftFoot: 0, standing: 1, rightFoot: 2 },
                //         left: { leftFoot: 3, standing: 4, rightFoot: 5 },
                //         right: { leftFoot: 9, standing: 10, rightFoot: 11 },
                //     },
                //     startPosition: { x: 40, y: 20 },
                //     offsetY: -4,
                // },
            ],
            tilemap: tilemap,
            NumberOfDirections: 4,
        };
        this.gridEngine.create(tilemap, gridEngineConfig);
        // this.gridEngine.movementStarted().subscribe(({ direction }) => {
        //     switch (direction) {
        //         case "up":
        //             playerSprite.anims.play("walk-up", true);
        //             break;
        //         case "down":
        //             playerSprite.anims.play("walk-down", true);
        //             break;
        //         case "left":
        //             playerSprite.anims.play("walk-left", true);
        //             break;
        //         case "right":
        //             playerSprite.anims.play("walk-right", true);
        //             break;
        //     }
        // });

        // this.gridEngine.movementStopped().subscribe(() => {
        //     playerSprite.anims.stop();
        // });

        EventBus.emit("current-scene-ready", this);
    }
    public spawnPlayer(id: string, x: number, y: number) {
        if (this.players[id]) return;

        const playerSprite = this.add.sprite(x, y, "snowman");
        this.players[id] = playerSprite;
        console.log(playerSprite)

        // this.gridEngine.addCharacter({
        //     id: id,
        //     sprite: playerSprite,
        //     startPosition: { x: x, y: y },
        //     walkingAnimationMapping: {
        //         up: { leftFoot: 6, standing: 7, rightFoot: 8 },
        //         down: { leftFoot: 0, standing: 1, rightFoot: 2 },
        //         left: { leftFoot: 3, standing: 4, rightFoot: 5 },
        //         right: { leftFoot: 9, standing: 10, rightFoot: 11 },
        //     },
        // });

        if (id === this.playerId) {
            this.cameras.main.startFollow(playerSprite, true);
            console.log(`Local player spawned at (${x}, ${y})`);
        } else {
            console.log(`Remote player ${id} spawned at (${x}, ${y})`);
        }
    }

    update() {
        const cursors = this.input.keyboard?.createCursorKeys()!;
        let direction: Direction | null = null;

        if (cursors.left.isDown) {
            direction = Direction.LEFT;
        } else if (cursors.right.isDown) {
            direction = Direction.RIGHT;
        } else if (cursors.up.isDown) {
            direction = Direction.UP;
        } else if (cursors.down.isDown) {
            direction = Direction.DOWN;
        }
        if (
            direction &&
            this.playerId &&
            !this.gridEngine.isMoving(this.playerId)
        ) {
            this.gridEngine.move(this.playerId, direction);
            this.sendPlayerMove(direction);
        }
    }
    private sendPlayerMove(direction: string) {
        this.client.sendMove(direction);
    }

    public updateOtherPlayer(id: string, x: number, y: number) {
        if (!this.players[id]) {
            this.spawnPlayer(id, x, y);
        }
        this.gridEngine.moveTo(id, { x, y });
    }

    public removePlayer(id: string) {
        if (this.players[id]) {
            this.players[id].destroy();
            delete this.players[id];
            console.log(`Removed player ${id}`);
        }
    }

    public setLocalPlayerId(id: string) {
        this.playerId = id;
    }

}