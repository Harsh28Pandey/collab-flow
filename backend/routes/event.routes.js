const express = require("express");
// NOTE: adjust this import path/names to match whatever your project already
// uses for the Task/Timesheet routes (e.g. "../middlewares/authMiddleware").
// It should expose:
//   - protect: verifies the JWT / session and attaches req.user
//   - adminOnly: 403s if req.user.role !== "admin"
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
} = require("../controllers/event.controller.js");

const router = express.Router();

// Any logged-in user (admin or regular) can read the global event list —
// this is what makes admin-created events show up on every user's calendar.
router.get("/", protect, getAllEvents);

// Only admins can create/edit/delete events.
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;

// In your main server file (e.g. server.js / app.js), mount this with:
//   const eventRoutes = require("./routes/eventRoutes");
//   app.use("/api/events", eventRoutes);