const express = require("express");
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, bulkDeleteTasks, updateTaskStatus, updateTaskChecklist } = require("../controllers/task.controller.js");

const router = express.Router();

//* Task management routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks);  //* get all tasks (admin: all, user: assigned)
router.get("/:id", protect, getTaskById);  //* get task by id
router.post("/", protect, adminOnly, createTask);  //* create a task (admin only)
router.put("/:id", protect, updateTask);  //* update task details
router.delete("/:id", protect, adminOnly, deleteTask);  //* delete a task (admin only)
router.delete("/bulk-delete", protect, adminOnly, bulkDeleteTasks);  //* bulk delete tasks (admin only)
router.put("/:id/status", protect, updateTaskStatus);  //* update task status
router.put("/:id/todo", protect, updateTaskChecklist);  //* update task checklist

module.exports = router;