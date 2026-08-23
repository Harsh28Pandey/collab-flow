const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        // true when the assistant refused because the question reached
        // for data outside the caller's allowed scope
        blocked: {
            type: Boolean,
            default: false,
        },
        // true when the user has edited this (user-role) message
        edited: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true } // gives every message its own _id + createdAt automatically
);

const collabChatSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        ownerRole: {
            type: String,
            enum: ["admin", "member"],
            required: true,
        },
        messages: [messageSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("CollabChat", collabChatSchema);