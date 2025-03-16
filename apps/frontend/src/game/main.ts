import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import {GridEngine} from "grid-engine"

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000',
    plugins: {
        scene: [{ 
            key: "gridEngine", 
            plugin: GridEngine, 
            mapping: "gridEngine", 
        }], 
    },
    pixelArt: true, 
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainGame,
        GameOver
    ]
};


const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
