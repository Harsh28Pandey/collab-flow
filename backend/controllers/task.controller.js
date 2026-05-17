const Task = require("../models/task.model.js");

/**
 * @desc Get all tasks (Admin: all, User: only assigned tasks)
 * @route GET /api/tasks/
 * @access Private
*/
const getTasks = async (req, res) => {
    try {
        // ✅ search, sortBy, sortOrder add karo
        const { status, search, sortBy, sortOrder } = req.query;
        const teamCode = req.user.teamCode;
        let filter = { teamCode };

        if (status) {
            filter.status = status;
        }

        // ✅ Search filter add karo
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        // ✅ Sort logic add karo
        let sort = { createdAt: -1 };  // default — newest first
        if (sortBy === "dueDate") sort = { dueDate: sortOrder === "asc" ? 1 : -1 };
        if (sortBy === "priority") sort = { priority: sortOrder === "asc" ? 1 : -1 };
        if (sortBy === "status") sort = { status: sortOrder === "asc" ? 1 : -1 };

        let tasks;

        if (req.user.role === "admin") {
            // ✅ .sort(sort) add karo
            tasks = await Task.find(filter).sort(sort).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        } else {
            // ✅ .sort(sort) add karo
            tasks = await Task.find({ ...filter, assignedTo: req.user._id }).sort(sort).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        }

        //* add completed todoChecklist count to each task
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed
                ).length;
                return { ...task._doc, completedTodoCount: completedCount };
            })
        );

        //* status summary counts
        const allTasks = await Task.countDocuments(
            req.user.role === "admin"
                ? { teamCode }
                : { teamCode, assignedTo: req.user._id }
        );
        const pendingTasks = await Task.countDocuments({
            teamCode,
            status: "Pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });
        const inProgressTasks = await Task.countDocuments({
            teamCode,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });
        const completedTasks = await Task.countDocuments({
            teamCode,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Get task by ID
 * @route GET /api/tasks/:id
 * @access Private (admin only)
*/
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // ✅ teamCode authorization check add karo
        if (task.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(task);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Create a new task (admin only)
 * @route POST /api/tasks/
 * @access Private (admin)
*/
const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({
                message: "Assigned to must be an array of user IDs"
            });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            teamCode: req.user.teamCode,
            todoChecklist,
            attachments
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Update task details
 * @route PUT /api/tasks/:id
 * @access Private
*/
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({
                    message: "Assigned to must be an array of user IDs"
                });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.json({
            message: "Task updated successfully",
            updatedTask
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Delete a task (admin only)
 * @route DELETE /api/tasks/:id
 * @access Private (admin)
*/
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        await task.deleteOne();
        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Bulk delete tasks (admin only)
 * @route DELETE /api/tasks/bulk-delete
 * @access Private (admin)
*/
// ✅ Ye poora naya function add karo getTaskById ke baad
const bulkDeleteTasks = async (req, res) => {
    try {
        const { taskIds } = req.body;
        const teamCode = req.user.teamCode;

        if (!Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "taskIds array is required" });
        }

        await Task.deleteMany({
            _id: { $in: taskIds },
            teamCode  // sirf usi team ke tasks delete honge
        });

        res.json({ message: `${taskIds.length} tasks deleted successfully` });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc Update task status
 * @route PUT /api/tasks/:id/status
 * @access Private
*/
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();
        res.json({
            message: "Task status updated successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Update task check list
 * @route PUT /api/tasks/:id/todo
 * @access Private
*/
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Not authorized to updated checklist"
            });
        }

        task.todoChecklist = todoChecklist;  //* replace with updated checklist

        //* Auto-update progress based on checklist completion
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;

        const totalItems = task.todoChecklist.length;
        task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        //* Auto-mark task as completed if all items are checked
        if (task.progress === 100) {
            task.status = "Completed";
        } else if (task.progress > 0) {
            task.status = "In Progress";
        } else {
            task.progress = "Pending";
        }

        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({
            message: "Task checklist updated successfully",
            task: updatedTask
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Dashboard data (admin only)
 * @route GET /api/tasks/dashboard-data
 * @access Private
*/
const getDashboardData = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;

        //* fetch statistics
        const totalTasks = await Task.countDocuments({ teamCode });
        const pendingTasks = await Task.countDocuments({ teamCode, status: "Pending" });
        const completedTasks = await Task.countDocuments({ teamCode, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            teamCode,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        //* ensure all possible statuses are included
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { teamCode } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");  //* remove spaces for response keys
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;  //* add total count to taskDistrbution

        //* ensure all priority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { teamCode } },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        //* fetch recent 10 tasks
        const recentTasks = await Task.find({ teamCode })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Dashboard data (user-specific)
 * @route /api/tasks/user-dashboard-data
 * @access Private
*/
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;  //* only fetch data for the logged-in user
        const teamCode = req.user.teamCode;

        //* fetch statistics for user-specific tasks
        const totalTasks = await Task.countDocuments({ teamCode, assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ teamCode, assignedTo: userId, status: "Pending" });
        const completedTasks = await Task.countDocuments({ teamCode, assignedTo: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            teamCode,
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        //* task distribution by status
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { teamCode, assignedTo: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        //* task distribution by priority
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { teamCode, assignedTo: userId } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        //* fetch recent 10 tasks for the logged-in user
        const recentTasks = await Task.find({ teamCode, assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, bulkDeleteTasks, updateTaskStatus, updateTaskChecklist, getDashboardData, getUserDashboardData };