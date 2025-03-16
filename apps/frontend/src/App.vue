<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import type { MainMenu } from './game/scenes/MainMenu';
import PhaserGame from './game/PhaserGame.vue'

// The sprite can only be moved in the MainMenu Scene
const canMoveSprite = ref();

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

const changeScene = () => {

    const scene = toRaw(phaserRef.value.scene) as MainMenu;

    if (scene)
    {
        //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
        scene.changeScene();
    }

}

const currentScene = (scene: MainMenu) => {

    canMoveSprite.value = (scene.scene.key !== "MainMenu");

}

</script>

<template>
    <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
</template>
