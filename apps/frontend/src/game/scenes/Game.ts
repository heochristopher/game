import {Direction,GridEngine} from 'grid-engine';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    private gridEngine!: GridEngine;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        
        this.camera = this.cameras.main;

        const tilemap = this.make.tilemap({ key: "game" }); 
        tilemap.addTilesetImage('spritesheet', 'spritesheet')

        for (let i = 0; i < tilemap.layers.length; i++) { 
            tilemap.createLayer(i, "spritesheet", 0, 0);
        } 

        const playerSprite = this.add.sprite(0, 0, "snowman"); 
        this.cameras.main.startFollow(playerSprite, true); 
        this.cameras.main.setFollowOffset( 
            -playerSprite.width / 2, 
            -playerSprite.height / 2
        );

        const gridEngineConfig = {
            characters: [
                {
                    id: "snowman",
                    sprite: playerSprite,
                    walkingAnimationMapping: 0,
                    startPosition: { x: 40, y: 20},
                    offsetY: -4
                }
            ]
        }
        this.gridEngine.create(tilemap, gridEngineConfig)

        EventBus.emit('current-scene-ready', this);
    }

    update() {
    const cursors = this.input.keyboard?.createCursorKeys()!; 
      if (cursors.left.isDown) { 
        this.gridEngine.move("snowman", Direction.LEFT); 
      } else if (cursors.right.isDown) { 
        this.gridEngine.move("snowman", Direction.RIGHT); 
      } else if (cursors.up.isDown) { 
        this.gridEngine.move("snowman", Direction.UP); 
      } else if (cursors.down.isDown) { 
        this.gridEngine.move("snowman", Direction.DOWN); 
      } 
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
