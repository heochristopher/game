<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';

import CodeEditor from '../components/CodeEditor.vue'

// Save the current scene instance
const scene = ref();
const game = ref();

const emit = defineEmits(['current-active-scene']);

onMounted(() => {

    game.value = StartGame('game-container');
    
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        
        emit('current-active-scene', scene_instance);
    
        scene.value = scene_instance;
    
    });

});

onUnmounted(() => {

    if (game.value)
    {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>

<template>
    <div class="phaser-game-container">
        <div id="game-container"></div>
        <CodeEditor v-if="editorVisible" @close="editorVisible = false"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PhaserGame',
  components: {
    CodeEditor,
  },
  data() {
    return {
      editorVisible: false,
    };
  },
  mounted() {
    // Listen for a global event from your Phaser game to open the editor.
    window.addEventListener('openEditor', this.openEditor);
  },
  beforeUnmount() {
    window.removeEventListener('openEditor', this.openEditor);
  },
  methods: {
    openEditor() {
      this.editorVisible = true;
    },
  },
});
</script>

<style scoped>
.phaser-game-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>