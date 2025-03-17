// Export global variables used by your Blockly code.
export let turtleX = 13;
export let turtleY = 13;
export let transformX = 0;
export let transformY = 0;
export let numBlocks = 0;
export let blockColors: string[] = [];
import * as Blockly from 'blockly'
export const WAIT_TIME = 100;

/**
 * Call this function after your BlockCodeEditor (or PhaserGame component) is mounted
 * so that the required DOM elements are present.
 */
export function initBlocklyIDE(): void {
    // Initialize the grid.
    const grid = document.querySelector(".grid");
    if (!grid) {
        console.error("Grid element not found");
        return;
    }
    // Clear grid (if needed) and create boxes.
    grid.innerHTML = "";
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
            const box = document.createElement("div");
            box.classList.add("box");
            // Use a unique id for each box.
            box.id = `${j + 1}_${i + 1}`;
            grid.appendChild(box);
        }
    }

    // Attach event listeners to play and reset buttons.
    const playButton = document.getElementById("play_button");
    const resetButton = document.getElementById("reset_button");

    if (playButton) {
        playButton.addEventListener("click", handlePlay);
    } else {
        console.warn("play_button element not found");
    }

    if (resetButton) {
        resetButton.addEventListener("click", handleReset);
    } else {
        console.warn("reset_button element not found");
    }
}

/**
 * Generates code from the Blockly workspace and runs it.
 */
export async function handlePlay(): Promise<void> {
    const workspace = Blockly.getMainWorkspace();
    if (!workspace) {
        console.error("Workspace not found");
        return;
    }
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log("Generated code:", code);
    try {
        // Wrap code in an async function.
        await eval(`(async () => { ${code} })()`);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Clears the Blockly workspace and resets the grid.
 */
export function handleReset(): void {
    const workspace = Blockly.getMainWorkspace();
    if (workspace) {
        workspace.clear();
    }
    // Reset all grid boxes to white.
    const allBoxes = document.querySelectorAll(".box");
    allBoxes.forEach((box) => {
        (box as HTMLElement).style.backgroundColor = "white";
    });
    // Reset turtle properties.
    const turtle = document.querySelector(".turtle-image") as HTMLElement;
    if (turtle) {
        turtle.style.transform = "translate(0px, 0px)";
    }
    turtleX = 13;
    turtleY = 13;
    transformX = 0;
    transformY = 0;
    numBlocks = 0;
    blockColors = [];
}

/**
 * Increases the number of blocks and stores the block color.
 */
export function loadBlocks(amount: number, color: string): void {
    console.log(numBlocks, "before");
    numBlocks += amount;
    for (let i = 0; i < amount; i++) {
        blockColors.push(color);
    }
    console.log(blockColors);
    console.log(numBlocks, "after");
}

/**
 * Sets the block color on the grid at the turtle's current position.
 */
export function setBlockColor(): void {
    if (numBlocks > 0) {
        const box = document.getElementById(`${turtleX}_${turtleY}`);
        if (box) {
            box.style.backgroundColor = blockColors.shift() || "white";
        }
        numBlocks -= 1;
    }
}

/**
 * Moves the turtle in the specified direction. The jump_scale controls how far to move.
 */
export async function shiftTurtle(
    direction: string,
    jump_scale: number
): Promise<void> {
    const turtle = document.querySelector(".turtle-image") as HTMLElement;
    if (!turtle) {
        console.error("Turtle element not found");
        return;
    }
    switch (direction) {
        case "left":
            if (turtleX > 1) {
                turtleX -= 1 * jump_scale;
                transformX -= 25 * jump_scale;
                turtle.style.transform = `translate(${transformX}px, ${transformY}px)`;
            }
            break;
        case "right":
            if (turtleX < 25) {
                turtleX += 1 * jump_scale;
                transformX += 25 * jump_scale;
                turtle.style.transform = `translate(${transformX}px, ${transformY}px)`;
            }
            break;
        case "up":
            if (turtleY > 1) {
                turtleY -= 1 * jump_scale;
                transformY -= 25 * jump_scale;
                turtle.style.transform = `translate(${transformX}px, ${transformY}px)`;
            }
            break;
        case "down":
            if (turtleY < 25) {
                turtleY += 1 * jump_scale;
                transformY += 25 * jump_scale;
                turtle.style.transform = `translate(${transformX}px, ${transformY}px)`;
            }
            break;
    }
    await delay(WAIT_TIME);
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

