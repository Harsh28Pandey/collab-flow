const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    teamCode: {
        type: String,
        required: true,
        index: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);