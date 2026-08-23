const CollabChat = require("../models/collabai.model.js");
const User = require("../models/user.model.js"); // adjust path if different
const { askCollabAI } = require("../utils/collabAiClient.js");
const { getTaskSummaryForUsers, getProjectSummaryForUsers } = require("../utils/collabAiDataSources.js");

const MAX_MESSAGE_LENGTH = 2000;
const MAX_TEAM_MEMBERS_IN_CONTEXT = 50;

const emptyTaskCounts = () => ({ total: 0, pending: 0, inProgress: 0, completed: 0 });

// ------------------------------------------------------------------
// MEMBER scope — only this account's own data.
// ------------------------------------------------------------------
const buildOwnContext = async (user) => {
    const taskData = await getTaskSummaryForUsers([user._id]);
    const projectData = await getProjectSummaryForUsers([user._id]);

    return {
        scope: "own",
        name: user.name,
        email: user.email,
        role: user.role,
        teamName: user.teamName || null,
        teamCode: user.teamCode || null,
        bio: user.bio || "",
        skills: user.skills || [],
        experienceLevel: user.experienceLevel || "Beginner",
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        isVerified: user.isVerified,
        memberSince: user.createdAt,
        tasks: taskData.available ? (taskData.byUser[user._id.toString()] || emptyTaskCounts()) : "not_available",
        projects: projectData.available ? (projectData.byUser[user._id.toString()] || { totalProjects: 0 }) : "not_available",
    };
};

// ------------------------------------------------------------------
// ADMIN scope — admin's own data + every member sharing the SAME
// teamCode, each WITH their task/project counts. Never touches users
// from a different teamCode.
// ------------------------------------------------------------------
const buildAdminContext = async (admin) => {
    const teamCode = admin.teamCode || null;

    let members = [];
    if (teamCode) {
        members = await User.find({ teamCode, _id: { $ne: admin._id } })
            .select("name email role bio skills experienceLevel githubUrl linkedinUrl isVerified createdAt")
            .limit(MAX_TEAM_MEMBERS_IN_CONTEXT)
            .lean();
    }

    const allIds = [admin._id, ...members.map((m) => m._id)];
    const taskData = await getTaskSummaryForUsers(allIds);
    const projectData = await getProjectSummaryForUsers(allIds);

    const tasksFor = (id) =>
        taskData.available ? (taskData.byUser[id.toString()] || emptyTaskCounts()) : "not_available";
    const projectsFor = (id) =>
        projectData.available ? (projectData.byUser[id.toString()] || { totalProjects: 0 }) : "not_available";

    return {
        scope: "team",
        admin: {
            name: admin.name,
            email: admin.email,
            role: admin.role,
            bio: admin.bio || "",
            skills: admin.skills || [],
            tasks: tasksFor(admin._id),
            projects: projectsFor(admin._id),
        },
        teamName: admin.teamName || null,
        teamCode,
        totalTeamMembers: members.length,
        teamMembers: members.map((m) => ({
            name: m.name,
            email: m.email,
            role: m.role,
            bio: m.bio || "",
            skills: m.skills || [],
            experienceLevel: m.experienceLevel || "Beginner",
            githubUrl: m.githubUrl || "",
            linkedinUrl: m.linkedinUrl || "",
            isVerified: m.isVerified,
            memberSince: m.createdAt,
            tasks: tasksFor(m._id),
            projects: projectsFor(m._id),
        })),
    };
};

const buildContextForUser = async (user) =>
    user.role === "admin" ? buildAdminContext(user) : buildOwnContext(user);

const MEMBER_CROSS_ACCOUNT_PATTERNS = [
    /other (user|admin|member)/i,
    /another (user|admin|member)/i,
    /someone else/i,
    /\ball (users|admins|members)\b/i,
    /every (user|admin|member)/i,
];

exports.askCollabAiController = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message is required" });
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)` });
        }

        const user = req.user;
        if (!user) return res.status(401).json({ message: "Not authorized" });

        let chat = await CollabChat.findOne({ owner: user._id });
        if (!chat) {
            chat = await CollabChat.create({ owner: user._id, ownerRole: user.role, messages: [] });
        }

        const trimmedMessage = message.trim();
        const scope = user.role === "admin" ? "team" : "own";

        const looksCrossAccount =
            user.role !== "admin" && MEMBER_CROSS_ACCOUNT_PATTERNS.some((re) => re.test(trimmedMessage));

        let answer;
        let blocked = false;

        if (looksCrossAccount) {
            answer = "Access not granted. You can only view and ask about your own account data.";
            blocked = true;
        } else {
            const contextData = await buildContextForUser(user);
            const history = chat.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

            try {
                answer = await askCollabAI({
                    question: trimmedMessage,
                    history,
                    contextData,
                    ownerName: user.name,
                    ownerRole: user.role,
                    scope,
                });
            } catch (aiError) {
                console.error("Collab AI upstream error:", aiError.message);
                return res.status(502).json({ message: "Collab AI is temporarily unavailable. Please try again shortly." });
            }

            if (
                user.role !== "admin" &&
                /another (user|admin|member)/i.test(answer) &&
                !/access not granted/i.test(answer)
            ) {
                answer = "Access not granted. You can only view and ask about your own account data.";
                blocked = true;
            }
        }

        chat.messages.push({ role: "user", content: trimmedMessage });
        chat.messages.push({ role: "assistant", content: answer, blocked });
        await chat.save();

        return res.status(200).json({
            answer,
            blocked,
            chatId: chat._id,
            messages: chat.messages,
        });
    } catch (error) {
        console.error("Collab AI error:", error);
        return res.status(500).json({ message: "Failed to get a response from Collab AI" });
    }
};

exports.getMyCollabHistory = async (req, res) => {
    try {
        const chat = await CollabChat.findOne({ owner: req.user._id });
        return res.status(200).json({ messages: chat?.messages || [] });
    } catch (error) {
        console.error("Collab AI history error:", error);
        return res.status(500).json({ message: "Failed to load chat history" });
    }
};

exports.clearMyCollabHistory = async (req, res) => {
    try {
        await CollabChat.findOneAndUpdate(
            { owner: req.user._id },
            { $set: { messages: [] } },
            { upsert: false }
        );
        return res.status(200).json({ message: "Chat history cleared" });
    } catch (error) {
        console.error("Collab AI clear error:", error);
        return res.status(500).json({ message: "Failed to clear chat history" });
    }
};

exports.updateMessageController = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Content is required" });
        }
        if (content.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)` });
        }

        const user = req.user;
        const chat = await CollabChat.findOne({ owner: user._id });
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const idx = chat.messages.findIndex((m) => m._id.toString() === messageId);
        if (idx === -1) return res.status(404).json({ message: "Message not found" });
        if (chat.messages[idx].role !== "user") {
            return res.status(400).json({ message: "Only your own questions can be edited" });
        }

        const trimmed = content.trim();
        chat.messages[idx].content = trimmed;
        chat.messages[idx].edited = true;
        chat.messages.splice(idx + 1);

        const scope = user.role === "admin" ? "team" : "own";
        const looksCrossAccount =
            user.role !== "admin" && MEMBER_CROSS_ACCOUNT_PATTERNS.some((re) => re.test(trimmed));

        let answer;
        let blocked = false;

        if (looksCrossAccount) {
            answer = "Access not granted. You can only view and ask about your own account data.";
            blocked = true;
        } else {
            const contextData = await buildContextForUser(user);
            const history = chat.messages.slice(0, idx).slice(-8).map((m) => ({ role: m.role, content: m.content }));

            try {
                answer = await askCollabAI({
                    question: trimmed,
                    history,
                    contextData,
                    ownerName: user.name,
                    ownerRole: user.role,
                    scope,
                });
            } catch (aiError) {
                console.error("Collab AI upstream error:", aiError.message);
                return res.status(502).json({ message: "Collab AI is temporarily unavailable. Please try again shortly." });
            }

            if (
                user.role !== "admin" &&
                /another (user|admin|member)/i.test(answer) &&
                !/access not granted/i.test(answer)
            ) {
                answer = "Access not granted. You can only view and ask about your own account data.";
                blocked = true;
            }
        }

        chat.messages.push({ role: "assistant", content: answer, blocked });
        await chat.save();

        return res.status(200).json({ messages: chat.messages });
    } catch (error) {
        console.error("Collab AI update error:", error);
        return res.status(500).json({ message: "Failed to update message" });
    }
};

exports.deleteMessageController = async (req, res) => {
    try {
        const { messageId } = req.params;
        const chat = await CollabChat.findOne({ owner: req.user._id });
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const idx = chat.messages.findIndex((m) => m._id.toString() === messageId);
        if (idx === -1) return res.status(404).json({ message: "Message not found" });

        chat.messages.splice(idx, 1);
        await chat.save();

        return res.status(200).json({ message: "Message deleted", messages: chat.messages });
    } catch (error) {
        console.error("Collab AI delete error:", error);
        return res.status(500).json({ message: "Failed to delete message" });
    }
};