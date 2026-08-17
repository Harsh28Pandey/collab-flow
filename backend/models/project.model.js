const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            "project_created",
            "project_updated",
            "status_changed",
            "priority_changed",
            "lead_changed",
            "member_added",
            "member_removed",
            "task_created",
            "task_assigned",
            "task_status_changed",
            "task_completed",
            "file_uploaded",
            "file_deleted",
            "project_archived"
        ],
        default: "project_updated"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        default: "Member"
    }
}, { _id: false });

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    projectCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    startDate: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium"
    },
    status: {
        type: String,
        enum: ["Planning", "Active", "On Hold", "Completed", "Archived"],
        default: "Planning"
    },
    projectLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [memberSchema],
    teamCode: {
        type: String,
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    activityLog: [activityLogSchema]
}, { timestamps: true });

//* prevent duplicate project codes within the same team
projectSchema.index({ teamCode: 1, projectCode: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);