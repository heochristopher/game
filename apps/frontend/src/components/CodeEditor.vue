<template>
  <div v-if="visible" class="blockly-modal">
    <div id="pageContainer">
      <!-- Blockly Workspace -->
      <div ref="blocklyDiv" class="blockly-div"></div>
      <!-- Buttons -->
      <div class="buttons">
        <button id="play_button" @click="handlePlay">Play</button>
        <button id="reset_button" @click="handleReset">Reset</button>
        <button @click="closeEditor">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as Blockly from 'blockly/core';
import * as JavaScript from 'blockly/javascript';
import 'blockly/blocks';
import 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';

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

// Attach generator functions for your custom blocks.
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

import {initBlocklyIDE} from '../blockly/index'
export default defineComponent({
  name: 'CodeEditor',
    setup() {
    const visible = ref(false);
    const blocklyDiv = ref<HTMLElement | null>(null);
    let workspace: Blockly.WorkspaceSvg | null = null;

    const openEditor = async () => {
      visible.value = true;
      await nextTick(); // Wait for DOM update.
      if (!workspace && blocklyDiv.value) {
        workspace = Blockly.inject(blocklyDiv.value, {
          toolbox: {
            kind: "flyoutToolbox",
            contents: [
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
              { kind: "block", type: "move_direction" },
              { kind: "block", type: "jump_blocks" },
              { kind: "block", type: "load_blocks" },
              { kind: "block", type: "drop_block" },
            ],
          },
          scrollbars: true,
          horizontalLayout: false,
          toolboxPosition: "start",
        });
      }
    };

    const closeEditor = () => {
      visible.value = false;
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handlePlay = async () => {
      if (!workspace) return;
      const code = javascriptGenerator.workspaceToCode(workspace);
      console.log('Generated code:', code);
      try {
        await eval(`(async () => { ${code} })()`);
      } catch (error) {
        console.error(error);
      }
    };

    const handleReset = () => {
      if (workspace) {
        workspace.clear();
      }
    };

    onMounted(() => {
        initBlocklyIDE()
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
    };
  },
});
</script>

<style scoped>
.blockly-modal {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  z-index: 1000;
  background: white;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

#pageContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.blockly-div {
  flex: 1;
  background-color: lightgray;
  min-width: 700px;
}

.buttons {
  padding-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
