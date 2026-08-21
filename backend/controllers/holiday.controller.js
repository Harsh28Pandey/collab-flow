const Holiday = require("../models/holiday.model.js");
const User = require("../models/user.model.js");
const { sendHolidayRequestEmail } = require("../emailVerify/verifyMail.js");

const daysBetween = (from, to) => {
    const start = new Date(new Date(from).setHours(0, 0, 0, 0));
    const end = new Date(new Date(to).setHours(0, 0, 0, 0));
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

// @desc    Apply for a new holiday/leave
// @route   POST /api/holidays
// @access  Private (any logged-in user)
const applyHoliday = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;
        if (!leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({ message: "Leave type, dates and reason are all required" });
        }
        if (new Date(toDate) < new Date(fromDate)) {
            return res.status(400).json({ message: "End date cannot be before the start date" });
        }

        const holiday = await Holiday.create({
            user: req.user._id,
            leaveType,
            fromDate,
            toDate,
            totalDays: daysBetween(fromDate, toDate),
            reason,
        });

        try {
            const admin = await User.findOne({
                teamCode: req.user.teamCode,
                role: "admin"
            });

            if (admin && admin.email) {
                await sendHolidayRequestEmail({
                    adminEmail: admin.email,
                    adminName: admin.name,
                    userName: req.user.name,
                    userEmail: req.user.email,
                    leaveType,
                    fromDate,
                    toDate,
                    totalDays: holiday.totalDays,
                    reason
                });
            } else {
                console.log("No admin found for teamCode:", req.user.teamCode, "- skipping holiday email");
            }
        } catch (mailErr) {
            console.error("Error sending holiday request email:", mailErr.message);
        }

        res.status(201).json({ message: "Holiday request submitted successfully", holiday });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get the logged-in user's own holiday requests
// @route   GET /api/holidays/my
// @access  Private
const getMyHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ holidays });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a holiday request — only allowed while still Pending, and only by its owner
// @route   PUT /api/holidays/:id
// @access  Private
const updateHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) return res.status(404).json({ message: "Holiday request not found" });
        if (String(holiday.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "You can only edit your own holiday requests" });
        }
        if (holiday.status !== "Pending") {
            return res.status(400).json({ message: "Only pending requests can be edited" });
        }

        const { leaveType, fromDate, toDate, reason } = req.body;
        if (!leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({ message: "Leave type, dates and reason are all required" });
        }
        if (new Date(toDate) < new Date(fromDate)) {
            return res.status(400).json({ message: "End date cannot be before the start date" });
        }

        holiday.leaveType = leaveType;
        holiday.fromDate = fromDate;
        holiday.toDate = toDate;
        holiday.totalDays = daysBetween(fromDate, toDate);
        holiday.reason = reason;

        const updated = await holiday.save();
        res.status(200).json({ message: "Holiday request updated successfully", holiday: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a holiday request — only allowed while still Pending, and only by its owner
// @route   DELETE /api/holidays/:id
// @access  Private
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) return res.status(404).json({ message: "Holiday request not found" });
        if (String(holiday.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "You can only delete your own holiday requests" });
        }
        if (holiday.status !== "Pending") {
            return res.status(400).json({ message: "Only pending requests can be deleted" });
        }

        await holiday.deleteOne();
        res.status(200).json({ message: "Holiday request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all holiday requests, across all users (optionally filtered by status)
// @route   GET /api/holidays?status=Pending
// @access  Private/Admin
const getAllHolidays = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status && ["Pending", "Approved", "Rejected"].includes(req.query.status)) {
            filter.status = req.query.status;
        }
        const holidays = await Holiday.find(filter)
            .populate("user", "name email profileImageUrl")
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ holidays });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Approve or reject a holiday request
// @route   PUT /api/holidays/:id/review
// @access  Private/Admin
const reviewHoliday = async (req, res) => {
    try {
        const { status, adminRemarks } = req.body;
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be Approved or Rejected" });
        }

        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) return res.status(404).json({ message: "Holiday request not found" });
        if (holiday.status !== "Pending") {
            return res.status(400).json({ message: "This request has already been reviewed" });
        }

        holiday.status = status;
        holiday.adminRemarks = adminRemarks || "";
        holiday.reviewedBy = req.user._id;
        holiday.reviewedAt = new Date();

        const updated = await holiday.save();
        res.status(200).json({ message: `Holiday request ${status.toLowerCase()}`, holiday: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    applyHoliday, getMyHolidays, updateHoliday, deleteHoliday, getAllHolidays, reviewHoliday,
};