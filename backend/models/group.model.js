const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: "",
        },

        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                role: {
                    type: String,
                    enum: ["admin", "member"],
                    default: "member",
                },
            },
        ],

        teamCode: {
            type: String,
            required: true,
        },

        inviteCode: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Group",
    groupSchema
);