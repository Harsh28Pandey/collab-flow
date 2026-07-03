const Event = require("../models/event.model.js");

// @desc    Create a new global calendar event (admin only)
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const { title, description, type, date, time } = req.body;

        if (!title || !description || !type || !date || !time) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const event = await Event.create({
            title,
            description,
            type,
            date,
            time,
            createdBy: req.user._id,
        });

        res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all global calendar events (visible to every logged-in user)
// @route   GET /api/events
// @access  Private
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate("createdBy", "name email")
            .sort({ date: 1 });

        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update an event (admin only)
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const { title, description, type, date, time } = req.body;

        if (!title || !description || !type || !date || !time) {
            return res.status(400).json({ message: "All fields are required" });
        }

        event.title = title;
        event.description = description;
        event.type = type;
        event.date = date;
        event.time = time;

        const updated = await event.save();
        res.status(200).json({ message: "Event updated successfully", event: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete an event (admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        await event.deleteOne();
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent };