const toolbox = {
    kind: "flyoutToolbox",
    contents: [
        {
            kind: "block",
            type: "controls_repeat_ext",
            inputs: {
                TIMES: {
                    shadow: {
                        type: "math_number",
                        fields: {
                            NUM: 5,
                        },
                    },
                },
            },
        },
        {
            kind: "block",
            type: "move_direction",
        },
        {
            kind: "block",
            type: "jump_blocks",
        },
        {
            kind: "block",
            type: "load_blocks",
        },
        {
            kind: "block",
            type: "drop_block",
        },
    ],
};
