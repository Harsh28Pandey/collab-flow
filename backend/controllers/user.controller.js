const Task = require("../models/task.model.js");
const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");

/**
 * @desc Get all users (admin only)
 * @route GET /api/users/
 * @access Private (admin)
*/
const getUsers = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;
        const users = await User.find({ role: "member", teamCode }).select("-password");

        //* add task counts to each user
        const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ teamCode, assignedTo: user._id, status: "Pending" });
            const inProgressTasks = await Task.countDocuments({ teamCode, assignedTo: user._id, status: "In Progress" });
            const completedTasks = await Task.countDocuments({ teamCode, assignedTo: user._id, status: "Completed" });

            return {
                ...user._doc,  //* include all existing user data
                pendingTasks,
                inProgressTasks,
                completedTasks
            }
        }));

        res.json(usersWithTaskCounts);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

/**
 * @desc Get user by id
 * @route GET /api/users/:id
 * @access Private
*/
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

/**
 * @desc Delete a user (admin only)
 * @route DELETE /api/users/:id
 * @access Private (admin)
*/
// const deleteUser = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(500).json({
//             message: "Server error",
//             error: error.message
//         });
//     }
// }

module.exports = { getUsers, getUserById };