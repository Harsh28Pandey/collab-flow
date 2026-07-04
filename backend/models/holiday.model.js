const mongoose = require("mongoose");

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Work From Home", "Unpaid Leave"];
const HOLIDAY_STATUS = ["Pending", "Approved", "Rejected"];

const HolidaySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        leaveType: {
            type: String,
            enum: LEAVE_TYPES,
            required: [true, "Leave type is required"],
        },
        fromDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        toDate: {
            type: Date,
            required: [true, "End date is required"],
        },
        totalDays: {
            type: Number,
            required: true,
            min: 1,
        },
        reason: {
            type: String,
            required: [true, "Reason is required"],
            trim: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: HOLIDAY_STATUS,
            default: "Pending",
        },
        adminRemarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

HolidaySchema.index({ user: 1, status: 1 });
HolidaySchema.index({ status: 1, fromDate: 1 });

module.exports = mongoose.model("Holiday", HolidaySchema);
module.exports.LEAVE_TYPES = LEAVE_TYPES;
module.exports.HOLIDAY_STATUS = HOLIDAY_STATUS;