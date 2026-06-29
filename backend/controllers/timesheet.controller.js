const Timesheet = require("../models/timesheet.model.js");
const User = require("../models/user.model.js");

// Helper: convert "HH:MM" (24hr) time string to minutes since midnight
const timeToMinutes = (time) => {
    if (!time || typeof time !== "string" || !time.includes(":")) {
        return null;
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
};

// Helper: calculate worked hours from clockIn, clockOut and breakMinutes
const calculateTotalHours = (clockIn, clockOut, breakMinutes = 0) => {
    const startMinutes = timeToMinutes(clockIn);
    const endMinutes = timeToMinutes(clockOut);

    if (startMinutes === null || endMinutes === null) {
        return 0;
    }

    // Handle overnight shifts (clockOut earlier than clockIn)
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
    }

    diffMinutes -= Number(breakMinutes) || 0;

    if (diffMinutes <= 0) {
        return 0;
    }

    // Round to 2 decimal places
    return Math.round((diffMinutes / 60) * 100) / 100;
};

const ATTENDANCE_OPTIONS = ["Present", "Absent", "Half Day", "Leave"];
const WORK_MODE_OPTIONS = ["Office", "WFH", "Hybrid"];

const createTimesheet = async (req, res) => {
    try {

        const {
            employeeId,
            project,
            date,
            attendanceStatus,
            workMode,
            clockIn,
            clockOut,
            breakMinutes,
            overtimeHours,
            notes,
            tasks,
        } = req.body;

        // Admin creates a timesheet on behalf of a selected employee.
        // Falls back to the logged-in user if no employeeId is sent
        // (keeps backward compatibility with the old self-create flow).
        const targetEmployeeId = employeeId || req.user._id;

        const employee = await User.findById(targetEmployeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // ---- REQUIRED FIELD VALIDATION ----
        const errors = {};

        if (!employeeId) {
            errors.employeeId = "Employee is required";
        }

        if (!date) {
            errors.date = "Date is required";
        }

        if (!project || !project.trim()) {
            errors.project = "Project name is required";
        }

        if (!attendanceStatus) {
            errors.attendanceStatus = "Attendance is required";
        } else if (!ATTENDANCE_OPTIONS.includes(attendanceStatus)) {
            errors.attendanceStatus = "Invalid attendance value";
        }

        if (!workMode) {
            errors.workMode = "Work mode is required";
        } else if (!WORK_MODE_OPTIONS.includes(workMode)) {
            errors.workMode = "Invalid work mode value";
        }

        if (!clockIn) {
            errors.clockIn = "Clock in is required";
        }

        if (!clockOut) {
            errors.clockOut = "Clock out is required";
        }

        if (breakMinutes === undefined || breakMinutes === null || breakMinutes === "") {
            errors.breakMinutes = "Break minutes is required";
        }

        if (overtimeHours === undefined || overtimeHours === null || overtimeHours === "") {
            errors.overtimeHours = "Overtime hours is required";
        }

        if (!notes || !notes.trim()) {
            errors.notes = "Notes is required";
        }

        if (!Array.isArray(tasks) || tasks.length === 0) {
            errors.tasks = "At least one task is required";
        } else {
            const taskErrors = {};

            tasks.forEach((task, index) => {
                const taskErr = {};

                if (!task?.title || !task.title.trim()) {
                    taskErr.title = "Task title is required";
                }

                if (
                    task?.hours === undefined ||
                    task?.hours === null ||
                    task?.hours === ""
                ) {
                    taskErr.hours = "Hours is required";
                }

                if (Object.keys(taskErr).length > 0) {
                    taskErrors[index] = taskErr;
                }
            });

            if (Object.keys(taskErrors).length > 0) {
                errors.taskDetails = taskErrors;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
                errors,
            });
        }

        // ---- NORMALIZE & SAVE ----

        const safeBreakMinutes = Number(breakMinutes) || 0;

        const totalHours = calculateTotalHours(
            clockIn,
            clockOut,
            safeBreakMinutes
        );

        // Normalize tasks: frontend sends { title, hours }, schema expects { title, duration }
        const safeTasks = tasks
            .filter((task) => task?.title?.trim())
            .map((task) => ({
                title: task.title.trim(),
                duration: Number(task.hours ?? task.duration) || 0,
            }));

        const timesheet = await Timesheet.create({

            employee: employee._id,

            employeeName: employee.name,

            employeeEmail: employee.email,

            department: employee.department || "",

            project: project.trim(),

            date,

            attendanceStatus,

            workMode,

            clockIn,

            clockOut,

            breakMinutes: safeBreakMinutes,

            totalHours,

            overtimeHours: Number(overtimeHours) || 0,

            notes: notes.trim(),

            tasks: safeTasks,

        });

        return res.status(201).json({
            success: true,
            message: "Timesheet created successfully",
            data: timesheet,
        });

    } catch (error) {

        console.error("Create Timesheet Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create timesheet",
        });

    }
};

const getAllTimesheets = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            status = "",
            filter = "",
            startDate = "",
            endDate = "",
            sortBy = "date",
            sortOrder = "desc",
        } = req.query;

        page = Math.max(parseInt(page) || 1, 1);
        limit = Math.max(parseInt(limit) || 10, 1);

        const query = {
            isDeleted: false,
        };

        // Status Filter
        if (
            status &&
            status !== "All"
        ) {
            query.status = status;
        }

        // Search
        if (search.trim()) {

            query.$or = [

                {
                    employeeName: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    employeeEmail: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    department: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    project: {
                        $regex: search,
                        $options: "i",
                    },
                },

            ];

        }

        // Today Filter
        if (filter === "today") {

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);

            tomorrow.setDate(today.getDate() + 1);

            query.date = {

                $gte: today,

                $lt: tomorrow,

            };

        }

        // Week Filter
        else if (filter === "week") {

            const now = new Date();

            const firstDay = new Date(now);

            firstDay.setDate(now.getDate() - now.getDay());

            firstDay.setHours(0, 0, 0, 0);

            const lastDay = new Date(firstDay);

            lastDay.setDate(firstDay.getDate() + 7);

            query.date = {

                $gte: firstDay,

                $lt: lastDay,

            };

        }

        // Month Filter
        else if (filter === "month") {

            const now = new Date();

            query.date = {

                $gte: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                ),

                $lt: new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    1
                ),

            };

        }

        // Custom Date Filter (overrides quick filters above if both provided)

        if (startDate && endDate) {

            query.date = {

                $gte: new Date(startDate),

                $lte: new Date(endDate),

            };

        }

        const allowedSortFields = [

            "date",

            "totalHours",

            "overtimeHours",

            "status",

            "employeeName",

        ];

        if (!allowedSortFields.includes(sortBy)) {

            sortBy = "date";

        }

        const sortObject = {

            [sortBy]:
                sortOrder === "asc"
                    ? 1
                    : -1,

        };

        const total = await Timesheet.countDocuments(query);

        const timesheets = await Timesheet.find(query)

            .populate(
                "employee",
                "name email department profileImageUrl"
            )

            .populate(
                "approvedBy",
                "name email profileImageUrl"
            )

            .sort(sortObject)

            .skip((page - 1) * limit)

            .limit(limit)

            .lean();

        return res.status(200).json({

            success: true,

            message: "Timesheets fetched successfully",

            pagination: {

                currentPage: page,

                totalPages: Math.ceil(total / limit),

                totalRecords: total,

                perPage: limit,

                hasNextPage:
                    page < Math.ceil(total / limit),

                hasPrevPage:
                    page > 1,

            },

            filters: {

                search,

                status,

                filter,

                startDate,

                endDate,

                sortBy,

                sortOrder,

            },

            data: timesheets,

        });

    } catch (error) {

        console.error("Get Timesheets Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch timesheets",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }
};

const getTimesheetStats = async (req, res) => {
    try {

        const [
            totalEmployees,
            stats,
            monthlyHours,
            weeklyHours,
            todayHours,
        ] = await Promise.all([

            User.countDocuments({
                role: "user",
            }),

            Timesheet.aggregate([

                {
                    $match: {
                        isDeleted: false,
                    },
                },

                {
                    $group: {

                        _id: null,

                        totalTimesheets: {
                            $sum: 1,
                        },

                        pending: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            "Pending",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        approved: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            "Approved",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        rejected: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            "Rejected",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        totalHours: {
                            $sum: "$totalHours",
                        },

                        totalOvertime: {
                            $sum: "$overtimeHours",
                        },

                        totalBreakMinutes: {
                            $sum: "$breakMinutes",
                        },

                    },

                },

            ]),

            // Monthly Hours

            Timesheet.aggregate([

                {
                    $match: {

                        isDeleted: false,

                        date: {

                            $gte: new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                1
                            ),

                        },

                    },

                },

                {

                    $group: {

                        _id: null,

                        totalHours: {
                            $sum: "$totalHours",
                        },

                    },

                },

            ]),

            // Weekly Hours

            Timesheet.aggregate([

                {

                    $match: {

                        isDeleted: false,

                        date: {

                            $gte: (() => {

                                const d = new Date();

                                d.setDate(
                                    d.getDate() - d.getDay()
                                );

                                d.setHours(0, 0, 0, 0);

                                return d;

                            })(),

                        },

                    },

                },

                {

                    $group: {

                        _id: null,

                        totalHours: {

                            $sum: "$totalHours",

                        },

                    },

                },

            ]),

            // Today's Hours

            Timesheet.aggregate([

                {

                    $match: {

                        isDeleted: false,

                        date: {

                            $gte: (() => {

                                const d = new Date();

                                d.setHours(0, 0, 0, 0);

                                return d;

                            })(),

                        },

                    },

                },

                {

                    $group: {

                        _id: null,

                        totalHours: {

                            $sum: "$totalHours",

                        },

                    },

                },

            ]),

        ]);

        const dashboard = stats[0] || {};

        return res.status(200).json({

            success: true,

            message: "Timesheet statistics fetched successfully",

            data: {

                totalEmployees,

                totalTimesheets:
                    dashboard.totalTimesheets || 0,

                pending:
                    dashboard.pending || 0,

                approved:
                    dashboard.approved || 0,

                rejected:
                    dashboard.rejected || 0,

                totalHours:
                    dashboard.totalHours || 0,

                totalOvertime:
                    dashboard.totalOvertime || 0,

                totalBreakMinutes:
                    dashboard.totalBreakMinutes || 0,

                monthlyHours:
                    monthlyHours[0]?.totalHours || 0,

                weeklyHours:
                    weeklyHours[0]?.totalHours || 0,

                todayHours:
                    todayHours[0]?.totalHours || 0,

            },

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Unable to fetch dashboard statistics",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }
};

// All employees' APPROVED timesheets — visible to every logged-in user (no private data)
const getMyApprovedTimesheets = async (req, res) => {
    try {

        const timesheets = await Timesheet.find({
            status: "Approved",
            isDeleted: false,
        })
            .populate(
                "employee",
                "name email profileImageUrl"
            )
            .sort({ date: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Approved timesheets fetched successfully",
            data: timesheets,
        });

    } catch (error) {

        console.error("Get My Timesheets Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch timesheets",
        });

    }
};

const getSingleTimesheet = async (req, res) => {
    try {

        const { id } = req.params;

        const timesheet = await Timesheet.findOne({
            _id: id,
            isDeleted: false,
        })
            .populate(
                "employee",
                "name email department profileImageUrl"
            )
            .populate(
                "approvedBy",
                "name email profileImageUrl"
            )
            .lean();

        if (!timesheet) {
            return res.status(404).json({
                success: false,
                message: "Timesheet not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: timesheet,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch timesheet",
        });

    }
};

const approveTimesheet = async (req, res) => {

    try {

        const { adminRemark = "" } = req.body;

        if (!adminRemark.trim()) {

            return res.status(400).json({
                success: false,
                message: "Approve reason is required",
            });

        }

        const timesheet = await Timesheet.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!timesheet) {

            return res.status(404).json({
                success: false,
                message: "Timesheet not found",
            });

        }

        if (timesheet.status === "Approved") {

            return res.status(400).json({
                success: false,
                message: "Already approved",
            });

        }

        timesheet.status = "Approved";
        timesheet.adminRemark = adminRemark;
        timesheet.rejectReason = "";
        timesheet.approvedBy = req.user._id;
        timesheet.approvedAt = new Date();

        await timesheet.save();

        return res.status(200).json({
            success: true,
            message: "Timesheet approved successfully",
            data: timesheet,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to approve timesheet",
        });

    }

};

const rejectTimesheet = async (req, res) => {

    try {

        const { rejectReason = "" } = req.body;

        if (!rejectReason.trim()) {

            return res.status(400).json({
                success: false,
                message: "Reject reason is required",
            });

        }

        const timesheet = await Timesheet.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!timesheet) {

            return res.status(404).json({
                success: false,
                message: "Timesheet not found",
            });

        }

        // Reject = permanently remove the timesheet record
        await Timesheet.deleteOne({ _id: timesheet._id });

        return res.status(200).json({
            success: true,
            message: "Timesheet rejected and removed successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to reject timesheet",
        });

    }

};

const deleteTimesheet = async (req, res) => {

    try {

        const timesheet = await Timesheet.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!timesheet) {

            return res.status(404).json({
                success: false,
                message: "Timesheet not found",
            });

        }

        timesheet.isDeleted = true;

        await timesheet.save();

        return res.status(200).json({
            success: true,
            message: "Timesheet deleted successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete timesheet",
        });

    }

};

module.exports = {
    createTimesheet,
    getAllTimesheets,
    getTimesheetStats,
    getMyApprovedTimesheets,
    getSingleTimesheet,
    approveTimesheet,
    rejectTimesheet,
    deleteTimesheet,
};