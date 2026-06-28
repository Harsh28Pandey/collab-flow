const mongoose = require("mongoose");

const timesheetSchema = new mongoose.Schema(
    {
        // Employee Reference
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Employee Snapshot
        employeeName: {
            type: String,
            default: "",
        },

        employeeEmail: {
            type: String,
            default: "",
        },

        department: {
            type: String,
            default: "",
        },

        project: {
            type: String,
            default: "",
        },

        // Date
        date: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },

        // Attendance
        attendanceStatus: {
            type: String,
            enum: [
                "Present",
                "Absent",
                "Half Day",
                "Leave",
            ],
            default: "Present",
        },

        // Work Mode
        workMode: {
            type: String,
            enum: [
                "Office",
                "WFH",
                "Hybrid",
            ],
            default: "Office",
        },

        // Time
        clockIn: {
            type: String,
            default: "",
        },

        clockOut: {
            type: String,
            default: "",
        },

        breakMinutes: {
            type: Number,
            default: 0,
        },

        totalHours: {
            type: Number,
            default: 0,
        },

        overtimeHours: {
            type: Number,
            default: 0,
        },

        // Daily Tasks
        tasks: [
            {
                title: {
                    type: String,
                    required: true,
                },

                duration: {
                    type: Number,
                    default: 0,
                },
            },
        ],

        // Employee Notes
        notes: {
            type: String,
            default: "",
        },

        // Admin Status
        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",
            ],
            default: "Pending",
            index: true,
        },

        // Admin Remark
        adminRemark: {
            type: String,
            default: "",
        },

        // Reject Reason
        rejectReason: {
            type: String,
            default: "",
        },

        // Approved By
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Approved Time
        approvedAt: {
            type: Date,
            default: null,
        },

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound Index
timesheetSchema.index({
    employee: 1,
    date: 1,
});

module.exports = mongoose.model("Timesheet", timesheetSchema);