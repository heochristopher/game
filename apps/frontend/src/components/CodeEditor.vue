<template>
  <div v-if="visible" class="blockly-modal">
    <div class="editor-container">
      <!-- Left: Blockly Workspace Area -->
      <div class="workspace-area">
        <div ref="blocklyDiv" class="blockly-div"></div>
        <div class="buttons">
          <button id="play_button" @click="handlePlay">Play</button>
          <button id="reset_button" @click="handleReset">Reset</button>
          <button @click="closeEditor">Close</button>
        </div>
      </div>
      <!-- Right: Grid Area -->
      <div class="grid-container">
        <div class="grid">
          <div
            v-for="row in gridSize"
            :key="'row-' + row"
            class="row"
          >
            <div
              v-for="col in gridSize"
              :key="'cell-' + row + '-' + col"
              class="grid-cell"
              :id="col + '_' + row"
            ></div>
          </div>
        </div>
        <!-- Turtle image rendered absolutely over the grid -->
        <img
          ref="turtleImage"
          class="turtle-image"
          :src="turtleImageSrc"
          alt="Turtle"
          :style="turtleStyle"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as Blockly from 'blockly/core';
import * as JavaScript from 'blockly/javascript';
import 'blockly/blocks';
import 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';

// --- Helper Functions ---
// (Replace these dummy implementations with your actual game logic)
function shiftTurtle(direction: string, jumpScale: number): Promise<void> {
  console.log(`shiftTurtle called: direction=${direction}, jumpScale=${jumpScale}`);
  // Update turtle position (dummy logic):
  if (direction === "left" && turtleX.value > 1) {
    turtleX.value -= jumpScale;
  } else if (direction === "right" && turtleX.value < gridSize.value) {
    turtleX.value += jumpScale;
  } else if (direction === "up" && turtleY.value > 1) {
    turtleY.value -= jumpScale;
  } else if (direction === "down" && turtleY.value < gridSize.value) {
    turtleY.value += jumpScale;
  }
  return new Promise(resolve => setTimeout(resolve, WAIT_TIME));
}

function loadBlocks(amount: number, color: string): void {
  console.log(`loadBlocks called: amount=${amount}, color=${color}`);
  // Color the grid cell at the turtle's current position.
  const cellId = `${turtleX.value}_${turtleY.value}`;
  const cell = document.getElementById(cellId);
  if (cell) {
    cell.style.backgroundColor = color;
  }
}

function setBlockColor(): void {
  console.log("setBlockColor called");
  // Set the turtle's current cell to yellow.
  const cellId = `${turtleX.value}_${turtleY.value}`;
  const cell = document.getElementById(cellId);
  if (cell) {
    cell.style.backgroundColor = "yellow";
  }
}

// Attach helper functions to window so that generated code can call them.
(window as any).shiftTurtle = shiftTurtle;
(window as any).loadBlocks = loadBlocks;
(window as any).setBlockColor = setBlockColor;

// --- Global Reactive Variables for Turtle Position ---
const gridSize = ref(25);
const turtleX = ref(13);
const turtleY = ref(13);
const WAIT_TIME = 200;

export default defineComponent({
  name: 'CodeEditor',
  setup() {
    const visible = ref(false);
    const blocklyDiv = ref<HTMLElement | null>(null);
    const gridContainer = ref<HTMLElement | null>(null);
    const turtleImageSrc = ref("../../assets/turtle.png");
    const workspace = ref<Blockly.WorkspaceSvg | null>(null);

    // Computed style for the turtle image based on turtleX and turtleY.
    const turtleStyle = computed(() => {
      return {
        position: 'absolute',
        top: ((turtleY.value - 1) * 25) + 'px',
        left: ((turtleX.value - 1) * 25) + 'px',
        width: '25px',
        height: '25px',
        transition: 'top 0.2s, left 0.2s'
      };
    });
const toolbox = {
  'kind': 'flyoutToolbox',
  'contents': [
    {
      'kind': 'block',
      'type': 'controls_repeat_ext',
      'inputs': {
        'TIMES': {
          'shadow': {
            'type': 'math_number',
            'fields': {
              'NUM': 5
            }
          }
        }
      }
    }, 
    {
      'kind': 'block',
      'type': 'move_direction'
    },
    {
      'kind': 'block',
      'type': 'jump_blocks'
    },
    {
      'kind': 'block',
      'type': 'load_blocks'
    },
    {
      'kind': 'block',
      'type': 'drop_block'
    }
  ]
};


    // Define custom blocks if not already defined.
    if (!Blockly.Blocks['move_direction']) {
      Blockly.common.defineBlocksWithJsonArray([
        {
          type: "move_direction",
          message0: "Move %1",
          args0: [
            {
              type: "field_dropdown",
              name: "DIRECTION",
              options: [
                ["LEFT", "left"],
                ["RIGHT", "right"],
                ["UP", "up"],
                ["DOWN", "down"],
              ],
            },
          ],
          previousStatement: null,
          nextStatement: null,
          colour: 160,
        },
        {
          type: "load_blocks",
          message0: "Load %1 blocks of color %2",
          args0: [
            {
              type: "field_number",
              name: "NUM_BLOCKS",
              value: 0,
              check: "Number",
            },
            {
              type: "field_input",
              name: "BLOCK_COLOR",
              text: "black",
            },
          ],
          previousStatement: null,
          nextStatement: null,
          colour: 200,
        },
        {
          type: "drop_block",
          message0: "Drop block",
          previousStatement: null,
          nextStatement: null,
          colour: 285,
        },
        {
          type: "jump_blocks",
          message0: "Jump %1 blocks %2",
          args0: [
            {
              type: "field_number",
              name: "NUM_BLOCKS",
              value: 0,
              check: "Number",
            },
            {
              type: "field_dropdown",
              name: "DIRECTION",
              options: [
                ["LEFT", "left"],
                ["RIGHT", "right"],
                ["UP", "up"],
                ["DOWN", "down"],
              ],
            },
          ],
          previousStatement: null,
          nextStatement: null,
          colour: 10,
        },
      ]);
    }

    // Attach generator functions for custom blocks.
    JavaScript.javascriptGenerator.forBlock["move_direction"] = function (block: any) {
      return "await shiftTurtle('" + block.getFieldValue("DIRECTION") + "', 1);\n";
    };
    JavaScript.javascriptGenerator.forBlock["load_blocks"] = function (block: any) {
      return (
        "loadBlocks(" +
        block.getFieldValue("NUM_BLOCKS") +
        ",'" +
        block.getFieldValue("BLOCK_COLOR") +
        "');\n"
      );
    };
    JavaScript.javascriptGenerator.forBlock["drop_block"] = function () {
      return "setBlockColor();\n";
    };
    JavaScript.javascriptGenerator.forBlock["jump_blocks"] = function (block: any) {
      return (
        "await shiftTurtle('" +
        block.getFieldValue("DIRECTION") +
        "'," +
        block.getFieldValue("NUM_BLOCKS") +
        ");\n"
      );
    };

    const openEditor = async () => {
      visible.value = true;
      await nextTick();
      if (!workspace.value && blocklyDiv.value) {
        workspace.value = Blockly.inject(blocklyDiv.value, {
          toolbox: toolbox,
          scrollbars: true,
          horizontalLayout: false,
          toolboxPosition: "start",
        });
      }
    };

    const closeEditor = () => {
      visible.value = false;
    };

    const handlePlay = async () => {
      if (!workspace.value) return;
      const code = javascriptGenerator.workspaceToCode(workspace.value);
      console.log('Generated code:', code);
      try {
        await eval(`(async () => { ${code} })()`);
      } catch (error) {
        console.error(error);
      }
    };

    const handleReset = () => {
      if (workspace.value) {
        workspace.value.clear();
      }
      // Reset grid cells to white.
      const cells = document.querySelectorAll('.grid-cell');
      cells.forEach(cell => {
        (cell as HTMLElement).style.backgroundColor = 'white';
      });
      // Reset turtle to center (approx. (13,13) for a 25x25 grid).
      turtleX.value = 13;
      turtleY.value = 13;
    };

    onMounted(() => {
      window.addEventListener("openEditor", openEditor);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("openEditor", openEditor);
    });

    return {
      visible,
      openEditor,
      closeEditor,
      handlePlay,
      handleReset,
      blocklyDiv,
      gridContainer,
      gridSize,
      turtleImageSrc,
      turtleStyle,
    };
  },
});
</script>

<style scoped>
.blockly-modal {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 90%;
  z-index: 1000;
  background: white;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.editor-container {
  display: flex;
  flex-direction: row;
  flex: 1;
}

.workspace-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.blockly-div {
  flex: 1;
  background-color: lightgray;
  min-width: 300px;
}

.buttons {
  padding-top: 10px;
  display: flex;
  gap: 10px;
}

.grid-container {
  position: relative;
  width: 625px;
  height: 625px;
  margin-left: 10px;
}

.grid {
  display: flex;
  flex-direction: column;
  width: 625px;
  height: 625px;
}

.row {
  display: flex;
  flex: 1;
}

.grid-cell {
  flex: 1;
  border: 1px solid #ddd;
  width: 25px;
  height: 25px;
  box-sizing: border-box;
}

.turtle-image {
  position: absolute;
  width: 25px;
  height: 25px;
  object-fit: contain;
  user-select: none;
  transition: top 0.2s, left 0.2s;
}
</style>
