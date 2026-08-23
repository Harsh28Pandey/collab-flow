// ------------------------------------------------------------------
// Collab AI — optional data sources.
// ------------------------------------------------------------------
// Each getXSummaryForUsers() function is INDEPENDENTLY guarded:
// - if the model file doesn't exist -> { available: false }
// - if the query/aggregation throws -> { available: false }
// This means adding a new data source later (timesheets, expenses,
// holidays, etc.) can NEVER break Collab AI as a whole — worst case,
// that one field just isn't shown, and the AI is told to say so
// instead of guessing (see buildSystemPrompt's "not_available" rule).
//
// TO ADD A NEW SOURCE LATER: copy one of these functions, point it at
// your model, adjust the field names, and call it from
// collabai.controller.js the same way tasks/projects are called.
// ------------------------------------------------------------------

let Task = null;
try {
    Task = require("../models/task.model.js"); // adjust path if yours differs
} catch (e) {
    console.warn("Collab AI: Task model not found — task summaries will be omitted.", e.message);
}

let Project = null;
try {
    Project = require("../models/project.model.js"); // adjust path if yours differs
} catch (e) {
    console.warn("Collab AI: Project model not found — project summaries will be omitted.", e.message);
}

const emptyTaskCounts = () => ({ total: 0, pending: 0, inProgress: 0, completed: 0 });

/**
 * Returns { available, byUser } where byUser is keyed by userId string.
 * Handles `assignedTo` being either a single ObjectId or an array.
 */
const getTaskSummaryForUsers = async (userIds) => {
    if (!Task) return { available: false, byUser: {} };
    if (!userIds?.length) return { available: true, byUser: {} };

    try {
        const rows = await Task.aggregate([
            {
                $project: {
                    status: 1,
                    assignedToArr: {
                        $cond: [{ $isArray: "$assignedTo" }, "$assignedTo", ["$assignedTo"]],
                    },
                },
            },
            { $unwind: "$assignedToArr" },
            { $match: { assignedToArr: { $in: userIds } } },
            {
                $group: {
                    _id: { user: "$assignedToArr", status: "$status" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const byUser = {};
        for (const id of userIds) byUser[id.toString()] = emptyTaskCounts();

        for (const row of rows) {
            const uid = row._id.user?.toString();
            if (!uid) continue;
            if (!byUser[uid]) byUser[uid] = emptyTaskCounts();

            const status = String(row._id.status || "").toLowerCase();
            byUser[uid].total += row.count;
            if (status.includes("progress")) byUser[uid].inProgress += row.count;
            else if (status.includes("complete") || status.includes("done")) byUser[uid].completed += row.count;
            else byUser[uid].pending += row.count;
        }

        return { available: true, byUser };
    } catch (err) {
        console.warn("Collab AI: task summary aggregation failed —", err.message);
        return { available: false, byUser: {} };
    }
};

/**
 * Returns { available, byUser } — how many projects each user is a
 * member of. Handles `members` being a single ObjectId or an array.
 */
const getProjectSummaryForUsers = async (userIds) => {
    if (!Project) return { available: false, byUser: {} };
    if (!userIds?.length) return { available: true, byUser: {} };

    try {
        const rows = await Project.aggregate([
            {
                $project: {
                    membersArr: { $cond: [{ $isArray: "$members" }, "$members", ["$members"]] },
                },
            },
            { $unwind: "$membersArr" },
            { $match: { membersArr: { $in: userIds } } },
            { $group: { _id: "$membersArr", totalProjects: { $sum: 1 } } },
        ]);

        const byUser = {};
        for (const id of userIds) byUser[id.toString()] = { totalProjects: 0 };
        for (const row of rows) {
            const uid = row._id?.toString();
            if (uid) byUser[uid] = { totalProjects: row.totalProjects };
        }

        return { available: true, byUser };
    } catch (err) {
        console.warn("Collab AI: project summary aggregation failed —", err.message);
        return { available: false, byUser: {} };
    }
};

module.exports = { getTaskSummaryForUsers, getProjectSummaryForUsers };