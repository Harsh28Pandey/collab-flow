const mongoose = require("mongoose");

// A single "Event" doc = one agenda/event/meeting/holiday created by an admin.
// It has no per-user owner field on purpose — every event created here is
// GLOBAL, i.e. every logged-in user (any role) should see it on their
// personal calendar. If you later need per-department or per-user targeting,
// add an `audience: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]`
// field and filter in the controller — but the default here is "everyone".

const EventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: [true, "Event description is required"],
            trim: true,
            maxlength: 1000,
        },
        type: {
            type: String,
            enum: ["Meeting", "Holiday", "Announcement", "Deadline", "Event"],
            default: "Event",
            required: true,
        },
        date: {
            type: Date,
            required: [true, "Event date is required"],
        },
        time: {
            // stored as "HH:mm" (24hr) string so it's easy to render either
            // "9:00 AM" or "21:00" on the client without timezone math
            type: String,
            required: [true, "Event time is required"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

EventSchema.index({ date: 1 });

module.exports = mongoose.model("Event", EventSchema);