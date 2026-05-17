const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    question: String,
    options: [
        {
            text: String,
            votes: [
                {
                    userId: String,
                    userName: String
                }
            ]
        }
    ],
    expiry: Date,
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    },
    teamCode: {
        type: String,
        required: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);