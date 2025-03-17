Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "move_direction",
        "message0": "Move %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "DIRECTION",
            "options": [
              ["LEFT", "left"],
              ["RIGHT", "right"],
              ["UP", "up"],
              ["DOWN", "down"]
            ]
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160
    },
    {
        "type": "load_blocks",
        "message0": "Load %1 blocks of color %2",
        "args0": [
            {
                "type": "field_number",
                "name": "NUM_BLOCKS",
                "value": 0,
                "check": "Number"
            }, {
                "type": "field_input",
                "name": "BLOCK_COLOR",
                "text": "black"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 200
    },
    {
        "type": "drop_block",
        "message0": "Drop block",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 285
    },
    {
        "type": "jump_blocks",
        "message0": "Jump %1 blocks %2",
        "args0": [
            {
                "type": "field_number",
                "name": "NUM_BLOCKS",
                "value": 0,
                "check": "Number"
            },
          {
            "type": "field_dropdown",
            "name": "DIRECTION",
            "options": [
              ["LEFT", "left"],
              ["RIGHT", "right"],
              ["UP", "up"],
              ["DOWN", "down"]
            ]
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 10
    }
    
]);
  
javascript.javascriptGenerator.forBlock['move_direction'] = function (block) {
    return "await shiftTurtle('" + block.getFieldValue('DIRECTION') + "', 1);\n";
};

javascript.javascriptGenerator.forBlock['load_blocks'] = function (block) {
    return "loadBlocks(" + block.getFieldValue('NUM_BLOCKS')+",'"+block.getFieldValue('BLOCK_COLOR') + "');\n";
};

javascript.javascriptGenerator.forBlock['drop_block'] = function (block) {
    return "setBlockColor();\n";
};

javascript.javascriptGenerator.forBlock['jump_blocks'] = function (block) {
    return "await shiftTurtle('" + block.getFieldValue('DIRECTION') + "',"+block.getFieldValue('NUM_BLOCKS') +");\n";
};