const Project = require("../models/project.model.js");
const Task = require("../models/task.model.js");
const User = require("../models/user.model.js");
const File = require("../models/file.model.js");

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const isMemberOfProject = (project, userId) => {
    const uid = userId.toString();
    if (project.projectLead && project.projectLead.toString() === uid) return true;
    return project.members.some((m) => m.user && m.user.toString() === uid);
};

const getTaskStatsForProject = async (projectId) => {
    const [total, completed, pending, inProgress, overdue] = await Promise.all([
        Task.countDocuments({ project: projectId }),
        Task.countDocuments({ project: projectId, status: "Completed" }),
        Task.countDocuments({ project: projectId, status: "Pending" }),
        Task.countDocuments({ project: projectId, status: "In Progress" }),
        Task.countDocuments({
            project: projectId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() }
        }),
    ]);

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        overdueTasks: overdue,
        progress
    };
};

/**
 * @desc Create a new project (admin only)
 * @route POST /api/projects
 * @access Private (admin)
*/
const createProject = async (req, res) => {
    try {
        const { name, description, projectCode, startDate, dueDate, priority, status, projectLead, members } = req.body;

        if (!name || !projectCode || !projectLead) {
            return res.status(400).json({
                message: "Project name, project code and project lead are required"
            });
        }

        const teamCode = req.user.teamCode;

        const existingCode = await Project.findOne({
            teamCode,
            projectCode: projectCode.toUpperCase()
        });

        if (existingCode) {
            return res.status(400).json({
                message: "A project with this code already exists"
            });
        }

        const memberIds = Array.isArray(members) ? [...new Set(members)] : [];

        const formattedMembers = memberIds
            .filter((id) => id && id !== projectLead)
            .map((id) => ({ user: id, role: "Member" }));

        const project = await Project.create({
            name,
            description,
            projectCode: projectCode.toUpperCase(),
            startDate,
            dueDate,
            priority: priority || "Medium",
            status: status || "Planning",
            projectLead,
            members: formattedMembers,
            teamCode,
            createdBy: req.user._id,
            activityLog: [{
                message: `Project created by ${req.user.name}`,
                type: "project_created",
                user: req.user._id
            }]
        });

        const populatedProject = await Project.findById(project._id)
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role");

        res.status(201).json({
            message: "Project created successfully",
            project: populatedProject
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Get all projects (Admin: all team projects, User: only assigned projects)
 * @route GET /api/projects
 * @access Private
*/
const getProjects = async (req, res) => {
    try {
        const { status, priority, projectLead, search } = req.query;
        const teamCode = req.user.teamCode;

        let filter = { teamCode };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (projectLead) filter.projectLead = projectLead;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { projectCode: { $regex: search, $options: "i" } }
            ];
        }

        if (req.user.role !== "admin") {
            const accessFilter = {
                $or: [
                    { projectLead: req.user._id },
                    { "members.user": req.user._id }
                ]
            };
            filter = { $and: [filter, accessFilter] };
        }

        let projects = await Project.find(filter)
            .sort({ createdAt: -1 })
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role");

        projects = await Promise.all(
            projects.map(async (project) => {
                const stats = await getTaskStatsForProject(project._id);
                return { ...project._doc, ...stats };
            })
        );

        //* status summary counts (role-aware)
        const summaryFilter = req.user.role === "admin"
            ? { teamCode }
            : { teamCode, $or: [{ projectLead: req.user._id }, { "members.user": req.user._id }] };

        const [all, planning, active, onHold, completed, archived] = await Promise.all([
            Project.countDocuments(summaryFilter),
            Project.countDocuments({ ...summaryFilter, status: "Planning" }),
            Project.countDocuments({ ...summaryFilter, status: "Active" }),
            Project.countDocuments({ ...summaryFilter, status: "On Hold" }),
            Project.countDocuments({ ...summaryFilter, status: "Completed" }),
            Project.countDocuments({ ...summaryFilter, status: "Archived" }),
        ]);

        res.json({
            projects,
            statusSummary: { all, planning, active, onHold, completed, archived }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Get project by id
 * @route GET /api/projects/:id
 * @access Private
*/
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role")
            .populate("createdBy", "name email");

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (req.user.role !== "admin" && !isMemberOfProject(project, req.user._id)) {
            return res.status(403).json({ message: "Not authorized to view this project" });
        }

        const stats = await getTaskStatsForProject(project._id);

        res.json({ project: { ...project._doc, ...stats } });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Update project details (admin only)
 * @route PUT /api/projects/:id
 * @access Private (admin)
*/
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { name, description, startDate, dueDate, status, priority, projectLead } = req.body;

        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (startDate) project.startDate = startDate;
        if (dueDate) project.dueDate = dueDate;

        if (status && status !== project.status) {
            const oldStatus = project.status;
            project.status = status;
            project.activityLog.unshift({
                message: `Project status changed from ${oldStatus} to ${status} by ${req.user.name}`,
                type: "status_changed",
                user: req.user._id
            });
        }

        if (priority && priority !== project.priority) {
            const oldPriority = project.priority;
            project.priority = priority;
            project.activityLog.unshift({
                message: `Project priority changed from ${oldPriority} to ${priority} by ${req.user.name}`,
                type: "priority_changed",
                user: req.user._id
            });
        }

        if (projectLead && projectLead !== project.projectLead.toString()) {
            const newLead = await User.findById(projectLead).select("name");
            project.activityLog.unshift({
                message: `Project lead changed to ${newLead?.name || "a new member"} by ${req.user.name}`,
                type: "lead_changed",
                user: req.user._id
            });
            project.projectLead = projectLead;
        }

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role");

        res.json({ message: "Project updated successfully", project: updatedProject });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Delete project (admin only)
 * @route DELETE /api/projects/:id
 * @access Private (admin)
*/
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        //* unlink tasks instead of deleting them, so Manage Tasks / My Tasks never break
        await Task.updateMany({ project: project._id }, { $set: { project: null } });

        await project.deleteOne();

        res.json({ message: "Project deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Archive project (admin only)
 * @route PUT /api/projects/:id/archive
 * @access Private (admin)
*/
const archiveProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        project.status = "Archived";
        project.activityLog.unshift({
            message: `Project archived by ${req.user.name}`,
            type: "project_archived",
            user: req.user._id
        });

        await project.save();

        res.json({ message: "Project archived successfully", project });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Update project status (admin only)
 * @route PUT /api/projects/:id/status
 * @access Private (admin)
*/
const updateProjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const oldStatus = project.status;
        project.status = status || project.status;

        if (oldStatus !== project.status) {
            project.activityLog.unshift({
                message: `Project status changed from ${oldStatus} to ${project.status} by ${req.user.name}`,
                type: "status_changed",
                user: req.user._id
            });
        }

        await project.save();

        res.json({ message: "Project status updated successfully", project });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Add member to project (admin only)
 * @route POST /api/projects/:id/members
 * @access Private (admin)
*/
const addMember = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.projectLead.toString() === userId) {
            return res.status(400).json({ message: "This user is already the project lead" });
        }

        const alreadyMember = project.members.some((m) => m.user.toString() === userId);
        if (alreadyMember) {
            return res.status(400).json({ message: "User is already a member of this project" });
        }

        const user = await User.findById(userId).select("name");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        project.members.push({ user: userId, role: role || "Member" });
        project.activityLog.unshift({
            message: `${user.name} added to the project by ${req.user.name}`,
            type: "member_added",
            user: req.user._id
        });

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role");

        res.json({ message: "Member added successfully", project: updatedProject });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Remove member from project (admin only)
 * @route DELETE /api/projects/:id/members/:memberId
 * @access Private (admin)
*/
const removeMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const memberId = req.params.memberId;
        const member = project.members.find((m) => m.user.toString() === memberId);
        const user = member ? await User.findById(memberId).select("name") : null;

        project.members = project.members.filter((m) => m.user.toString() !== memberId);

        project.activityLog.unshift({
            message: `${user?.name || "A member"} removed from the project by ${req.user.name}`,
            type: "member_removed",
            user: req.user._id
        });

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role");

        res.json({ message: "Member removed successfully", project: updatedProject });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Change project lead (admin only)
 * @route PUT /api/projects/:id/lead
 * @access Private (admin)
*/
const changeProjectLead = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const newLead = await User.findById(userId).select("name");
        if (!newLead) {
            return res.status(404).json({ message: "User not found" });
        }

        const oldLeadId = project.projectLead.toString();

        //* if new lead was already a member, drop them from the members list
        project.members = project.members.filter((m) => m.user.toString() !== userId);

        //* keep the old lead attached to the project as a normal member
        if (oldLeadId !== userId) {
            project.members.push({ user: oldLeadId, role: "Member" });
        }

        project.projectLead = userId;

        project.activityLog.unshift({
            message: `Project lead changed to ${newLead.name} by ${req.user.name}`,
            type: "lead_changed",
            user: req.user._id
        });

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("projectLead", "name email profileImageUrl role")
            .populate("members.user", "name email profileImageUrl role");

        res.json({ message: "Project lead changed successfully", project: updatedProject });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Get project activity log
 * @route GET /api/projects/:id/activity
 * @access Private
*/
const getProjectActivity = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("activityLog.user", "name profileImageUrl");

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (req.user.role !== "admin" && !isMemberOfProject(project, req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json({ activity: project.activityLog });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Get files linked to a project (reuses existing File model, doesn't touch file routes)
 * @route GET /api/projects/:id/files
 * @access Private
*/
const getProjectFiles = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (req.user.role !== "admin" && !isMemberOfProject(project, req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const files = await File.find({ project: project._id })
            .populate("uploadedBy", "name email profileImageUrl role")
            .sort({ createdAt: -1 });

        res.json({ success: true, files });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Dashboard stats for projects (role aware) — used by Admin & User dashboards
 * @route GET /api/projects/dashboard-stats
 * @access Private
*/
const getProjectDashboardStats = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;

        const baseFilter = req.user.role === "admin"
            ? { teamCode }
            : { teamCode, $or: [{ projectLead: req.user._id }, { "members.user": req.user._id }] };

        const [total, active, completed, onHold, planning] = await Promise.all([
            Project.countDocuments(baseFilter),
            Project.countDocuments({ ...baseFilter, status: "Active" }),
            Project.countDocuments({ ...baseFilter, status: "Completed" }),
            Project.countDocuments({ ...baseFilter, status: "On Hold" }),
            Project.countDocuments({ ...baseFilter, status: "Planning" }),
        ]);

        const overdue = await Project.countDocuments({
            ...baseFilter,
            dueDate: { $lt: new Date() },
            status: { $nin: ["Completed", "Archived"] }
        });

        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const upcomingDeadlines = await Project.countDocuments({
            ...baseFilter,
            dueDate: { $gte: now, $lte: nextWeek },
            status: { $nin: ["Completed", "Archived"] }
        });

        res.json({
            stats: { total, active, completed, onHold, planning, overdue, upcomingDeadlines }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    archiveProject,
    updateProjectStatus,
    addMember,
    removeMember,
    changeProjectLead,
    getProjectActivity,
    getProjectFiles,
    getProjectDashboardStats
};