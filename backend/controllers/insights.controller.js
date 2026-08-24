const { buildAdminInsights } = require("../utils/insightsEngine.js");
const { askTeamInsightsAI } = require("../utils/collabAiClient.js");
const { buildUserInsights } = require("../utils/insightsEngine.js");
const { askPersonalInsightsAI } = require("../utils/collabAiClient.js");

const parseRange = (rangeParam) => {
    if (rangeParam === "all") return null;
    const n = parseInt(rangeParam, 10);
    if ([7, 30, 90].includes(n)) return n;
    return 30; // default
};

exports.getAdminInsights = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;
        if (!teamCode) {
            return res.status(400).json({ message: "No team associated with this account" });
        }

        const rangeDays = parseRange(req.query.range);
        const data = await buildAdminInsights(teamCode, rangeDays);

        return res.status(200).json({
            teamName: req.user.teamName || null,
            teamCode,
            ...data,
        });
    } catch (error) {
        console.error("Admin insights error:", error);
        return res.status(500).json({ message: "Failed to build insights", error: error.message });
    }
};

exports.getAdminInsightsAiSummary = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;
        if (!teamCode) {
            return res.status(400).json({ message: "No team associated with this account" });
        }

        const rangeDays = parseRange(req.query.range);
        const data = await buildAdminInsights(teamCode, rangeDays);

        // Condensed, AI-facing digest — only the numbers/names actually needed for a narrative
        const digest = {
            teamName: req.user.teamName || null,
            totalMembers: data.totalMembers,
            tasks: data.overallTaskAnalytics,
            activeProjectsCount: data.activeProjectsCount,
            projectHealth: data.projectsPerformance.map((p) => ({
                name: p.name, status: p.status, healthScore: p.healthScore,
                overdueTasks: p.overdueTasks, totalTasks: p.totalTasks,
            })),
            overdueTaskCount: data.overdueTasks.length,
            stalledTaskCount: data.stalledTasks.length,
            criticalDeadlines: data.deadlineRisks.filter((t) => t.riskLevel === "Critical").length,
            overloadedMembers: data.memberStats.filter((m) => m.workloadLevel === "Overloaded").map((m) => m.name),
            topPerformers: data.topPerformers.map((m) => ({ name: m.name, completed: m.completedInRange })),
            bottleneckProject: data.bottleneckProject
                ? { name: data.bottleneckProject.name, overdueTasks: data.bottleneckProject.overdueTasks, totalTasks: data.bottleneckProject.totalTasks }
                : null,
        };

        const summary = await askTeamInsightsAI(digest);
        return res.status(200).json({ summary });
    } catch (error) {
        console.error("Insights AI summary error:", error);
        return res.status(502).json({ message: "AI summary is temporarily unavailable. Please try again shortly." });
    }
};

exports.getMyInsights = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;
        if (!teamCode) {
            return res.status(400).json({ message: "No team associated with this account" });
        }

        const rangeDays = parseRange(req.query.range);
        // req.user._id comes only from the verified JWT (see protect middleware) —
        // never from a client-supplied id, so this endpoint can only ever return
        // the logged-in account's own data.
        const data = await buildUserInsights(teamCode, req.user._id, rangeDays);

        return res.status(200).json(data);
    } catch (error) {
        console.error("User insights error:", error);
        return res.status(500).json({ message: "Failed to build insights", error: error.message });
    }
};

exports.getMyInsightsAiSummary = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;
        if (!teamCode) {
            return res.status(400).json({ message: "No team associated with this account" });
        }

        const rangeDays = parseRange(req.query.range);
        const data = await buildUserInsights(teamCode, req.user._id, rangeDays);

        const digest = {
            name: data.me.name,
            tasks: data.personalTaskAnalytics,
            myProjects: data.myProjects.map((p) => ({ name: p.name, status: p.status, myTasks: p.myTasks })),
            overdueTaskCount: data.overdueTasks.length,
            stalledTaskCount: data.stalledTasks.length,
            criticalDeadlines: data.deadlineRisks.filter((t) => t.riskLevel === "Critical").length,
            workloadLevel: data.personalTaskAnalytics.workloadLevel,
        };

        const summary = await askPersonalInsightsAI(digest);
        return res.status(200).json({ summary });
    } catch (error) {
        console.error("User insights AI summary error:", error);
        return res.status(502).json({ message: "AI summary is temporarily unavailable. Please try again shortly." });
    }
};