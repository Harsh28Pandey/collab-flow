const express = require("express");
const router = express.Router();
const {
    createTimesheet,
    getAllTimesheets,
    getTimesheetStats,
    getMyApprovedTimesheets,
    getSingleTimesheet,
    approveTimesheet,
    rejectTimesheet,
    deleteTimesheet,
} = require("../controllers/timesheet.controller.js");
const { adminOnly, protect } = require("../middlewares/auth.middleware.js");

router.post(
    "/",
    protect,
    createTimesheet
);

router.get("/", protect, adminOnly, getAllTimesheets);
router.get("/stats", protect, adminOnly, getTimesheetStats);

// All employees' approved timesheets — visible to every logged-in user
router.get("/my-timesheets", protect, getMyApprovedTimesheets);

// Get one Timesheet
router.get(
    "/:id",
    protect,
    adminOnly,
    getSingleTimesheet
);

// Approve
router.put(
    "/approve/:id",
    protect,
    adminOnly,
    approveTimesheet
);

// Reject
router.put(
    "/reject/:id",
    protect,
    adminOnly,
    rejectTimesheet
);

// Delete
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteTimesheet
);

module.exports = router;