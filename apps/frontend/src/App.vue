<script setup lang="ts">
import { ref } from 'vue';
import PhaserGame from './game/PhaserGame.vue';

// Remove the import for MainMenu since that scene is no longer used

// Flag that can control if the sprite should be movable; adjust logic as needed.
const canMoveSprite = ref(true);

// Reference to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

// This handler is called when the active scene changes.
// Adjust this logic if you need to disable sprite movement in some scenes.
const currentScene = (scene: any) => {
  // For example, you might decide:
  // canMoveSprite.value = (scene.scene.key !== "SomeOtherScene");
  // For now, we simply allow movement in all scenes:
  canMoveSprite.value = true;
};

</script>

<template>
  <div id="app">
    <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
  </div>
</template>
