const express = require("express");
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const {
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
} = require("../controllers/project.controller.js");

const router = express.Router();

//* Project management routes
router.get("/dashboard-stats", protect, getProjectDashboardStats);  //* role-aware project stats
router.get("/", protect, getProjects);  //* get all projects (admin: all, user: assigned only)
router.get("/:id", protect, getProjectById);  //* get project by id
router.post("/", protect, adminOnly, createProject);  //* create a project (admin only)
router.put("/:id", protect, adminOnly, updateProject);  //* update project details (admin only)
router.delete("/:id", protect, adminOnly, deleteProject);  //* delete a project (admin only)
router.put("/:id/archive", protect, adminOnly, archiveProject);  //* archive a project (admin only)
router.put("/:id/status", protect, adminOnly, updateProjectStatus);  //* change project status (admin only)
router.post("/:id/members", protect, adminOnly, addMember);  //* add member to project (admin only)
router.delete("/:id/members/:memberId", protect, adminOnly, removeMember);  //* remove member (admin only)
router.put("/:id/lead", protect, adminOnly, changeProjectLead);  //* change project lead (admin only)
router.get("/:id/activity", protect, getProjectActivity);  //* get project activity timeline
router.get("/:id/files", protect, getProjectFiles);  //* get project files (reuses File model)

module.exports = router;