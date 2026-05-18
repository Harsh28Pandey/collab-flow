const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: { type: String, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema); 