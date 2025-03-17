/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import * as Blockly from 'blockly';
// import {blocks} from './blocks/text';
// import {forBlock} from './generators/javascript';
// import {javascriptGenerator} from 'blockly/javascript';
// import {save, load} from './serialization';
// import {toolbox} from './toolbox';
// import './index.css';

//add grid

let turtleX = 13;
let turtleY = 13;
let transformX = 0;
let transformY = 0;
let numBlocks = 0; 
let blockColors = [];

const WAIT_TIME = 100;

const play_button = document.getElementById("play_button");
const reset_button = document.getElementById("reset_button");
const turtle = document.querySelector(".turtle-image");

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector('.grid');

  for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const box = document.createElement('div');
        box.classList.add('box');
        box.id = String(String(j + 1) + "_" + String(i + 1));
        console.log(box.id)
        grid.appendChild(box);
      } 
  }
})


// for pauses
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// handle play - finish later
async function handlePlay() {
  //const workspace = Blockly.getMainWorkspace();
  //loadWorkspace() //?? is this necessary because i only have one
  let code = javascript.javascriptGenerator.workspaceToCode(Blockly.getMainWorkspace());
  try {
    await eval(`(async () => { ${code} })()`);
  } catch (error) {
    console.log(error);
  }
}

// handle reset
function handleReset() {
  // Reset all grid blocks to white background
  const allBlocks = document.querySelectorAll('.box'); // Select all blocks (class name used for grid blocks)
  allBlocks.forEach(block => {
    block.style.backgroundColor = 'white'; // Set the background to white
  });
  turtle.style.transform = 'translate(0px,0px)';
  turtleX = 13;
  turtleY = 13;
  transformX = 0;
  transformY = 0;
  numBlocks = 0; 
  blockColors = [];
}

// block functions

function loadBlocks(amount, color) {
  console.log(numBlocks,"before")
  numBlocks += amount;
  for (let i = 0; i < amount; i++) {
    blockColors.push(color);
  }
  console.log(blockColors);
  console.log(numBlocks,"after")
}

// color block
function setBlockColor() {
  if (numBlocks > 0) {
    const block = document.getElementById(`${turtleX}_${turtleY}`);
    block.style.backgroundColor = blockColors.shift();
    numBlocks -= 1;
  }
}



// shift turtle in direction
async function shiftTurtle(direction, jump_scale) {
  switch (direction) {
    case "left":
      if (turtleX > 1) {
        turtleX -= 1*jump_scale;
        transformX -= 25*jump_scale;
        turtle.style.transform = `translate(${transformX}px,${transformY}px)`;
      }
      break;
    case "right":
      if (turtleX < 25) {
        turtleX += 1*jump_scale;
        transformX += 25*jump_scale;
        turtle.style.transform = `translate(${transformX}px,${transformY}px)`;
      }
      break;
    case "up":
      if (turtleY > 1) {
        turtleY -= 1*jump_scale;
        transformY -= 25*jump_scale;
        turtle.style.transform = `translate(${transformX}px,${transformY}px)`;
      }
      break;
    case "down":
      if (turtleY < 25) {
        turtleY += 1*jump_scale;
        transformY += 25*jump_scale;
        turtle.style.transform = `translate(${transformX}px,${transformY}px)`;
      }
      break;
  }
  await delay(WAIT_TIME);
}


// event listeners
play_button.addEventListener('click', handlePlay);
reset_button.addEventListener('click', handleReset)


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

Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  scrollbars: true,
  horizontalLayout: false,
  toolboxPosition: "start",
});
/* CODE THAT CAME WITH FILE
// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  outputDiv.innerHTML = '';

  eval(code);
};

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  runCode();
});
*/




