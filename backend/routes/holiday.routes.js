const express = require("express");
// Adjust to match your project's real auth middleware path/names.
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const {
    applyHoliday, getMyHolidays, updateHoliday, deleteHoliday, getAllHolidays, reviewHoliday,
} = require("../controllers/holiday.controller.js");

const router = express.Router();

// Admin: view every request (optionally ?status=Pending) + approve/reject
router.get("/", protect, adminOnly, getAllHolidays);
router.put("/:id/review", protect, adminOnly, reviewHoliday);

// Any logged-in user: apply, view their own, edit/delete while still pending
router.post("/", protect, applyHoliday);
router.get("/my", protect, getMyHolidays);
router.put("/:id", protect, updateHoliday);
router.delete("/:id", protect, deleteHoliday);

module.exports = router;