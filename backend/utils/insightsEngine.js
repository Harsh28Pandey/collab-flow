const Task = require("../models/task.model.js");
const Project = require("../models/project.model.js");
const User = require("../models/user.model.js");

// ------------------------------------------------------------------
// Tunable thresholds — change these in one place if behaviour needs
// adjusting later.
// ------------------------------------------------------------------
const WORKLOAD_LIGHT_MAX = 2;       // <= this many active tasks = "Light"
const WORKLOAD_OVERLOADED_MIN = 8;  // >= this many active tasks = "Overloaded"
const STALE_DAYS = 3;               // "In Progress" + 0% progress + untouched this long = "Stalled"
const RISK_CRITICAL_DAYS = 1;
const RISK_HIGH_DAYS = 3;
const RISK_MEDIUM_DAYS = 7;
const ACTIVITY_FEED_LIMIT = 30;
const TREND_MAX_DAYS = 90; // cap chart size even if range=all

const daysBetween = (a, b) => Math.round((a - b) / (1000 * 60 * 60 * 24));

// ------------------------------------------------------------------
// 1. Overall Task Analytics
// ------------------------------------------------------------------
const getOverallTaskAnalytics = async (teamCode, now) => {
    const [totals, avgCompletionAgg] = await Promise.all([
        Task.aggregate([
            { $match: { teamCode } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                                1, 0,
                            ],
                        },
                    },
                    low: { $sum: { $cond: [{ $eq: ["$priority", "Low"] }, 1, 0] } },
                    medium: { $sum: { $cond: [{ $eq: ["$priority", "Medium"] }, 1, 0] } },
                    high: { $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] } },
                },
            },
        ]),
        // Estimated avg completion time (createdAt -> updatedAt, only for Completed tasks)
        Task.aggregate([
            { $match: { teamCode, status: "Completed" } },
            {
                $project: {
                    hoursTaken: { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60] },
                },
            },
            { $group: { _id: null, avgHours: { $avg: "$hoursTaken" }, sample: { $sum: 1 } } },
        ]),
    ]);

    const t = totals[0] || {};
    const total = t.total || 0;
    const completed = t.completed || 0;
    const avg = avgCompletionAgg[0] || {};

    return {
        total,
        pending: t.pending || 0,
        inProgress: t.inProgress || 0,
        completed,
        overdue: t.overdue || 0,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        priorityBreakdown: { Low: t.low || 0, Medium: t.medium || 0, High: t.high || 0 },
        avgCompletionHoursEstimated: avg.avgHours ? Math.round(avg.avgHours * 10) / 10 : null,
        avgCompletionSampleSize: avg.sample || 0,
    };
};

// ------------------------------------------------------------------
// 2. All Projects Performance (+ Health Score) — batched, no N+1
// ------------------------------------------------------------------
const getProjectsPerformance = async (teamCode, now) => {
    const [projects, taskStatsRaw] = await Promise.all([
        Project.find({ teamCode })
            .populate("projectLead", "name email profileImageUrl")
            .select("name description projectCode status priority startDate dueDate projectLead members createdAt")
            .lean(),
        Task.aggregate([
            { $match: { teamCode, project: { $ne: null } } },
            {
                $group: {
                    _id: "$project",
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                                1, 0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    const statsMap = {};
    taskStatsRaw.forEach((row) => { statsMap[row._id.toString()] = row; });

    const withStats = projects.map((p) => {
        const s = statsMap[p._id.toString()] || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 };
        const progress = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;

        // Health score: 70% weight on completion, 30% penalty on overdue ratio.
        // No tasks yet -> health is null ("Not started"), not a false 100.
        let healthScore = null;
        if (s.total > 0) {
            const overdueRatio = s.overdue / s.total;
            healthScore = Math.round(Math.max(0, Math.min(100, progress * 0.7 + (1 - overdueRatio) * 30)));
        }

        const isOverdueProject = p.dueDate && new Date(p.dueDate) < now && !["Completed", "Archived"].includes(p.status);

        return {
            _id: p._id,
            name: p.name,
            projectCode: p.projectCode,
            status: p.status,
            priority: p.priority,
            dueDate: p.dueDate,
            projectLead: p.projectLead,
            memberCount: (p.members || []).length,
            totalTasks: s.total,
            completedTasks: s.completed,
            pendingTasks: s.pending,
            inProgressTasks: s.inProgress,
            overdueTasks: s.overdue,
            progress,
            healthScore,
            isOverdueProject,
        };
    });

    // Standalone (no-project) tasks summarized as a pseudo-entry so nothing is hidden
    const standalone = await Task.aggregate([
        { $match: { teamCode, project: null } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                overdue: {
                    $sum: {
                        $cond: [
                            { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                            1, 0,
                        ],
                    },
                },
            },
        },
    ]);

    return {
        projects: withStats.sort((a, b) => (a.healthScore ?? 999) - (b.healthScore ?? 999)),
        standaloneTasks: standalone[0]
            ? { total: standalone[0].total, completed: standalone[0].completed, overdue: standalone[0].overdue }
            : { total: 0, completed: 0, overdue: 0 },
    };
};

// ------------------------------------------------------------------
// 3 & 4. Team Productivity + Member Workload (one pass, shared query)
// ------------------------------------------------------------------
const getMemberStats = async (teamCode, sinceDate, now) => {
    const [members, agg] = await Promise.all([
        User.find({ teamCode }).select("name email role profileImageUrl skills experienceLevel").lean(),
        Task.aggregate([
            { $match: { teamCode } },
            { $unwind: "$assignedTo" },
            {
                $group: {
                    _id: "$assignedTo",
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    completedInRange: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$status", "Completed"] }, { $gte: ["$updatedAt", sinceDate] }] },
                                1, 0,
                            ],
                        },
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                                1, 0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    const statsMap = {};
    agg.forEach((row) => { statsMap[row._id.toString()] = row; });

    const enriched = members.map((m) => {
        const s = statsMap[m._id.toString()] || { total: 0, pending: 0, inProgress: 0, completed: 0, completedInRange: 0, overdue: 0 };
        const active = s.pending + s.inProgress;

        let workloadLevel = "Balanced";
        if (active >= WORKLOAD_OVERLOADED_MIN) workloadLevel = "Overloaded";
        else if (active <= WORKLOAD_LIGHT_MAX) workloadLevel = "Light";

        const completionRate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;

        return {
            _id: m._id,
            name: m.name,
            email: m.email,
            role: m.role,
            profileImageUrl: m.profileImageUrl,
            skills: m.skills || [],
            experienceLevel: m.experienceLevel,
            totalAssigned: s.total,
            pending: s.pending,
            inProgress: s.inProgress,
            completed: s.completed,
            completedInRange: s.completedInRange,
            overdueAssigned: s.overdue,
            activeTasks: active,
            workloadLevel,
            completionRate,
        };
    });

    const topPerformers = [...enriched]
        .filter((m) => m.completedInRange > 0)
        .sort((a, b) => b.completedInRange - a.completedInRange)
        .slice(0, 5);

    return { members: enriched, topPerformers };
};

// ------------------------------------------------------------------
// 5. Overdue & Stalled ("Blocked") Tasks
// ------------------------------------------------------------------
const getOverdueAndStalledTasks = async (teamCode, now) => {
    const staleThreshold = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000);

    const [overdue, stalled] = await Promise.all([
        Task.find({ teamCode, status: { $ne: "Completed" }, dueDate: { $lt: now } })
            .populate("assignedTo", "name email profileImageUrl")
            .populate("project", "name projectCode")
            .select("title priority status dueDate assignedTo project updatedAt")
            .sort({ dueDate: 1 })
            .limit(50)
            .lean(),
        Task.find({ teamCode, status: "In Progress", progress: 0, updatedAt: { $lt: staleThreshold } })
            .populate("assignedTo", "name email profileImageUrl")
            .populate("project", "name projectCode")
            .select("title priority status dueDate assignedTo project updatedAt")
            .sort({ updatedAt: 1 })
            .limit(50)
            .lean(),
    ]);

    return {
        overdueTasks: overdue.map((t) => ({ ...t, daysOverdue: daysBetween(now, new Date(t.dueDate)) })),
        stalledTasks: stalled.map((t) => ({ ...t, daysStalled: daysBetween(now, new Date(t.updatedAt)) })),
    };
};

// ------------------------------------------------------------------
// 6. Deadline Risks (next 7 days, not yet completed)
// ------------------------------------------------------------------
const getDeadlineRisks = async (teamCode, now) => {
    const windowEnd = new Date(now.getTime() + RISK_MEDIUM_DAYS * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
        teamCode,
        status: { $ne: "Completed" },
        dueDate: { $gte: now, $lte: windowEnd },
    })
        .populate("assignedTo", "name email profileImageUrl")
        .populate("project", "name projectCode")
        .select("title priority status dueDate assignedTo project")
        .sort({ dueDate: 1 })
        .limit(100)
        .lean();

    return tasks.map((t) => {
        const daysUntil = daysBetween(new Date(t.dueDate), now);
        let riskLevel = "Medium";
        if (daysUntil <= RISK_CRITICAL_DAYS) riskLevel = "Critical";
        else if (daysUntil <= RISK_HIGH_DAYS) riskLevel = "High";
        return { ...t, daysUntil, riskLevel };
    });
};

// ------------------------------------------------------------------
// 7. Team Activity Feed — merges Project.activityLog + standalone task events
// ------------------------------------------------------------------
const getTeamActivity = async (teamCode) => {
    const [projects, standaloneTasks] = await Promise.all([
        Project.find({ teamCode })
            .select("name activityLog")
            .populate("activityLog.user", "name profileImageUrl")
            .lean(),
        Task.find({ teamCode, project: null })
            .select("title status createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .limit(30)
            .lean(),
    ]);

    const fromProjects = projects.flatMap((p) =>
        (p.activityLog || []).map((a) => ({
            message: a.message,
            type: a.type,
            user: a.user,
            projectName: p.name,
            createdAt: a.createdAt,
        }))
    );

    const fromStandalone = standaloneTasks.flatMap((t) => {
        const events = [{ message: `Task "${t.title}" created`, type: "task_created", projectName: "Standalone", createdAt: t.createdAt }];
        if (t.status === "Completed") {
            events.push({ message: `Task "${t.title}" completed`, type: "task_completed", projectName: "Standalone", createdAt: t.updatedAt });
        }
        return events;
    });

    return [...fromProjects, ...fromStandalone]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, ACTIVITY_FEED_LIMIT);
};

// ------------------------------------------------------------------
// 8. Completion Trends — daily created vs completed (estimated), capped days
// ------------------------------------------------------------------
const getCompletionTrends = async (teamCode, rangeDays, now) => {
    const days = Math.min(rangeDays, TREND_MAX_DAYS);
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    since.setHours(0, 0, 0, 0);

    const [createdRaw, completedRaw] = await Promise.all([
        Task.aggregate([
            { $match: { teamCode, createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        ]),
        Task.aggregate([
            { $match: { teamCode, status: "Completed", updatedAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } },
        ]),
    ]);

    const createdMap = Object.fromEntries(createdRaw.map((r) => [r._id, r.count]));
    const completedMap = Object.fromEntries(completedRaw.map((r) => [r._id, r.count]));

    const series = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        series.push({ date: key, created: createdMap[key] || 0, completed: completedMap[key] || 0 });
    }
    return series;
};

// ------------------------------------------------------------------
// 9. Skill coverage across the team
// ------------------------------------------------------------------
const getSkillCoverage = async (teamCode) => {
    const users = await User.find({ teamCode }).select("skills").lean();
    const freq = {};
    users.forEach((u) => (u.skills || []).forEach((s) => {
        const key = s.trim();
        if (!key) return;
        freq[key] = (freq[key] || 0) + 1;
    }));
    return Object.entries(freq)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
};

// ------------------------------------------------------------------
// MAIN AGGREGATOR
// ------------------------------------------------------------------
const buildAdminInsights = async (teamCode, rangeDays) => {
    const now = new Date();
    const sinceDate = rangeDays === null ? new Date(0) : new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const trendDays = rangeDays === null ? 30 : rangeDays;

    const [
        overallTaskAnalytics,
        projectsPerformance,
        memberStats,
        overdueAndStalled,
        deadlineRisks,
        teamActivity,
        completionTrends,
        skillCoverage,
        totalMembers,
    ] = await Promise.all([
        getOverallTaskAnalytics(teamCode, now),
        getProjectsPerformance(teamCode, now),
        getMemberStats(teamCode, sinceDate, now),
        getOverdueAndStalledTasks(teamCode, now),
        getDeadlineRisks(teamCode, now),
        getTeamActivity(teamCode),
        getCompletionTrends(teamCode, trendDays, now),
        getSkillCoverage(teamCode),
        User.countDocuments({ teamCode }),
    ]);

    // Bottleneck: project with the worst overdue ratio (min 1 task)
    const bottleneckProject = projectsPerformance.projects
        .filter((p) => p.totalTasks > 0)
        .sort((a, b) => (b.overdueTasks / b.totalTasks) - (a.overdueTasks / a.totalTasks))[0] || null;

    return {
        generatedAt: now,
        rangeDays,
        totalMembers,
        overallTaskAnalytics,
        projectsPerformance: projectsPerformance.projects,
        standaloneTasks: projectsPerformance.standaloneTasks,
        activeProjectsCount: projectsPerformance.projects.filter((p) => p.status === "Active").length,
        memberStats: memberStats.members,
        topPerformers: memberStats.topPerformers,
        overdueTasks: overdueAndStalled.overdueTasks,
        stalledTasks: overdueAndStalled.stalledTasks,
        deadlineRisks,
        teamActivity,
        completionTrends,
        skillCoverage,
        bottleneckProject,
        meta: {
            avgCompletionEstimated: true,
            stalledIsHeuristic: true,
            staleDaysThreshold: STALE_DAYS,
        },
    };
};

// ====================================================================
// USER-SCOPED INSIGHTS — everything below is filtered by userId, never
// by teamCode alone. A member only ever sees rows where they are the
// assignee (tasks) or a lead/member (projects) — nothing about
// teammates' individual task loads is aggregated or exposed here.
// ====================================================================

// ------------------------------------------------------------------
// Personal task analytics
// ------------------------------------------------------------------
const getPersonalTaskAnalytics = async (teamCode, userId, now) => {
    const [totals, avgAgg] = await Promise.all([
        Task.aggregate([
            { $match: { teamCode, assignedTo: userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                                1, 0,
                            ],
                        },
                    },
                    low: { $sum: { $cond: [{ $eq: ["$priority", "Low"] }, 1, 0] } },
                    medium: { $sum: { $cond: [{ $eq: ["$priority", "Medium"] }, 1, 0] } },
                    high: { $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] } },
                },
            },
        ]),
        Task.aggregate([
            { $match: { teamCode, assignedTo: userId, status: "Completed" } },
            { $project: { hoursTaken: { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60] } } },
            { $group: { _id: null, avgHours: { $avg: "$hoursTaken" }, sample: { $sum: 1 } } },
        ]),
    ]);

    const t = totals[0] || {};
    const total = t.total || 0;
    const completed = t.completed || 0;
    const avg = avgAgg[0] || {};
    const active = (t.pending || 0) + (t.inProgress || 0);

    let workloadLevel = "Balanced";
    if (active >= WORKLOAD_OVERLOADED_MIN) workloadLevel = "Overloaded";
    else if (active <= WORKLOAD_LIGHT_MAX) workloadLevel = "Light";

    return {
        total,
        pending: t.pending || 0,
        inProgress: t.inProgress || 0,
        completed,
        overdue: t.overdue || 0,
        activeTasks: active,
        workloadLevel,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        priorityBreakdown: { Low: t.low || 0, Medium: t.medium || 0, High: t.high || 0 },
        avgCompletionHoursEstimated: avg.avgHours ? Math.round(avg.avgHours * 10) / 10 : null,
        avgCompletionSampleSize: avg.sample || 0,
    };
};

// ------------------------------------------------------------------
// Projects the user leads or is a member of — project-level totals
// (already visible to them via the existing project detail page) plus
// a personal breakdown of only THEIR tasks inside that project. No
// other member's individual numbers are included.
// ------------------------------------------------------------------
const getMyProjects = async (teamCode, userId, now) => {
    const projects = await Project.find({
        teamCode,
        $or: [{ projectLead: userId }, { "members.user": userId }],
    })
        .populate("projectLead", "name email profileImageUrl")
        .select("name description projectCode status priority startDate dueDate projectLead members createdAt")
        .lean();

    if (projects.length === 0) return [];

    const projectIds = projects.map((p) => p._id);

    const [overallStats, myStats] = await Promise.all([
        Task.aggregate([
            { $match: { teamCode, project: { $in: projectIds } } },
            {
                $group: {
                    _id: "$project",
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                                1, 0,
                            ],
                        },
                    },
                },
            },
        ]),
        Task.aggregate([
            { $match: { teamCode, project: { $in: projectIds }, assignedTo: userId } },
            {
                $group: {
                    _id: "$project",
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "Completed"] }, { $lt: ["$dueDate", now] }] },
                                1, 0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    const overallMap = {};
    overallStats.forEach((r) => { overallMap[r._id.toString()] = r; });
    const myMap = {};
    myStats.forEach((r) => { myMap[r._id.toString()] = r; });

    return projects.map((p) => {
        const o = overallMap[p._id.toString()] || { total: 0, completed: 0, overdue: 0 };
        const mine = myMap[p._id.toString()] || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 };
        const progress = o.total > 0 ? Math.round((o.completed / o.total) * 100) : 0;

        let healthScore = null;
        if (o.total > 0) {
            const overdueRatio = o.overdue / o.total;
            healthScore = Math.round(Math.max(0, Math.min(100, progress * 0.7 + (1 - overdueRatio) * 30)));
        }

        return {
            _id: p._id,
            name: p.name,
            projectCode: p.projectCode,
            status: p.status,
            priority: p.priority,
            dueDate: p.dueDate,
            projectLead: p.projectLead,
            isLead: p.projectLead?._id?.toString() === userId.toString(),
            overallProgress: progress,
            overallTotalTasks: o.total,
            healthScore,
            myTasks: {
                total: mine.total,
                completed: mine.completed,
                pending: mine.pending,
                inProgress: mine.inProgress,
                overdue: mine.overdue,
            },
        };
    });
};

// ------------------------------------------------------------------
// My overdue & stalled tasks
// ------------------------------------------------------------------
const getPersonalOverdueAndStalled = async (teamCode, userId, now) => {
    const staleThreshold = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000);

    const [overdue, stalled] = await Promise.all([
        Task.find({ teamCode, assignedTo: userId, status: { $ne: "Completed" }, dueDate: { $lt: now } })
            .populate("project", "name projectCode")
            .select("title priority status dueDate project updatedAt")
            .sort({ dueDate: 1 })
            .limit(50)
            .lean(),
        Task.find({ teamCode, assignedTo: userId, status: "In Progress", progress: 0, updatedAt: { $lt: staleThreshold } })
            .populate("project", "name projectCode")
            .select("title priority status dueDate project updatedAt")
            .sort({ updatedAt: 1 })
            .limit(50)
            .lean(),
    ]);

    return {
        overdueTasks: overdue.map((t) => ({ ...t, daysOverdue: daysBetween(now, new Date(t.dueDate)) })),
        stalledTasks: stalled.map((t) => ({ ...t, daysStalled: daysBetween(now, new Date(t.updatedAt)) })),
    };
};

// ------------------------------------------------------------------
// My deadline risks
// ------------------------------------------------------------------
const getPersonalDeadlineRisks = async (teamCode, userId, now) => {
    const windowEnd = new Date(now.getTime() + RISK_MEDIUM_DAYS * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
        teamCode,
        assignedTo: userId,
        status: { $ne: "Completed" },
        dueDate: { $gte: now, $lte: windowEnd },
    })
        .populate("project", "name projectCode")
        .select("title priority status dueDate project")
        .sort({ dueDate: 1 })
        .limit(100)
        .lean();

    return tasks.map((t) => {
        const daysUntil = daysBetween(new Date(t.dueDate), now);
        let riskLevel = "Medium";
        if (daysUntil <= RISK_CRITICAL_DAYS) riskLevel = "Critical";
        else if (daysUntil <= RISK_HIGH_DAYS) riskLevel = "High";
        return { ...t, daysUntil, riskLevel };
    });
};

// ------------------------------------------------------------------
// My activity — built only from tasks assigned to this user, never
// from other members' project activity entries.
// ------------------------------------------------------------------
const getPersonalActivity = async (teamCode, userId) => {
    const tasks = await Task.find({ teamCode, assignedTo: userId })
        .populate("project", "name")
        .select("title status project createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();

    const events = tasks.flatMap((t) => {
        const list = [{
            message: `Task "${t.title}" assigned to you`,
            type: "task_created",
            projectName: t.project?.name || "Standalone",
            createdAt: t.createdAt,
        }];
        if (t.status === "Completed") {
            list.push({
                message: `You completed "${t.title}"`,
                type: "task_completed",
                projectName: t.project?.name || "Standalone",
                createdAt: t.updatedAt,
            });
        }
        return list;
    });

    return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, ACTIVITY_FEED_LIMIT);
};

// ------------------------------------------------------------------
// My completion trend
// ------------------------------------------------------------------
const getPersonalCompletionTrends = async (teamCode, userId, rangeDays, now) => {
    const days = Math.min(rangeDays, TREND_MAX_DAYS);
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    since.setHours(0, 0, 0, 0);

    const [createdRaw, completedRaw] = await Promise.all([
        Task.aggregate([
            { $match: { teamCode, assignedTo: userId, createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        ]),
        Task.aggregate([
            { $match: { teamCode, assignedTo: userId, status: "Completed", updatedAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } },
        ]),
    ]);

    const createdMap = Object.fromEntries(createdRaw.map((r) => [r._id, r.count]));
    const completedMap = Object.fromEntries(completedRaw.map((r) => [r._id, r.count]));

    const series = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        series.push({ date: key, created: createdMap[key] || 0, completed: completedMap[key] || 0 });
    }
    return series;
};

// ------------------------------------------------------------------
// MAIN USER AGGREGATOR
// ------------------------------------------------------------------
const buildUserInsights = async (teamCode, userId, rangeDays) => {
    const now = new Date();
    const trendDays = rangeDays === null ? 30 : rangeDays;

    const me = await User.findById(userId).select("name email skills experienceLevel profileImageUrl").lean();

    const [
        personalTaskAnalytics,
        myProjects,
        overdueAndStalled,
        deadlineRisks,
        myActivity,
        completionTrends,
    ] = await Promise.all([
        getPersonalTaskAnalytics(teamCode, userId, now),
        getMyProjects(teamCode, userId, now),
        getPersonalOverdueAndStalled(teamCode, userId, now),
        getPersonalDeadlineRisks(teamCode, userId, now),
        getPersonalActivity(teamCode, userId),
        getPersonalCompletionTrends(teamCode, userId, trendDays, now),
    ]);

    return {
        generatedAt: now,
        rangeDays,
        me: { name: me?.name, email: me?.email, skills: me?.skills || [], experienceLevel: me?.experienceLevel, profileImageUrl: me?.profileImageUrl },
        personalTaskAnalytics,
        myProjects,
        activeProjectsCount: myProjects.filter((p) => p.status === "Active").length,
        overdueTasks: overdueAndStalled.overdueTasks,
        stalledTasks: overdueAndStalled.stalledTasks,
        deadlineRisks,
        myActivity,
        completionTrends,
        meta: { avgCompletionEstimated: true, stalledIsHeuristic: true, staleDaysThreshold: STALE_DAYS },
    };
};

module.exports = { buildAdminInsights, buildUserInsights };