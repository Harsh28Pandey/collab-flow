const Poll = require("../models/poll.model.js");

//* Create Poll (Admin only)
const createPoll = async (req, res) => {
    try {
        const { question, options, expiry } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({ msg: "Invalid poll data" });
        }

        const poll = new Poll({
            question,
            options: options.map(opt => ({
                text: opt,
                votes: []
            })),
            expiry,
            status: "active",
            teamCode: req.user.teamCode
        });

        await poll.save();

        res.status(201).json({
            success: true,
            poll
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//* Get Polls (Logged-in users)
const getPolls = async (req, res) => {
    const teamCode = req.user.teamCode;
    try {
        const now = new Date();

        // 🔥 1. Bulk update (fast + scalable)
        await Poll.updateMany(
            {
                teamCode,
                expiry: { $lt: now },
                status: "active"
            },
            {
                $set: { status: "expired" }
            }
        );

        // 🔥 2. Fresh data fetch after update
        const polls = await Poll.find({ teamCode });

        res.json({
            success: true,
            polls
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//* Vote Poll (Logged-in users)
const votePoll = async (req, res) => {
    try {
        const { pollId, optionIndex } = req.body;

        const userId = req.user.id;
        const userName = req.user.name;

        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({ msg: "Poll not found" });
        }

        if (poll.teamCode !== req.user.teamCode) {
            return res.status(403).json({ msg: "Not authorized" });
        }

        if (poll.status === "expired") {
            return res.status(400).json({ msg: "Poll expired" });
        }

        if (
            optionIndex < 0 ||
            optionIndex >= poll.options.length
        ) {
            return res.status(400).json({ msg: "Invalid option" });
        }

        // duplicate vote check
        const alreadyVoted = poll.options.some(opt =>
            opt.votes.some(v => v.userId === userId)
        );

        if (alreadyVoted) {
            return res.status(400).json({ msg: "Already voted" });
        }

        poll.options[optionIndex].votes.push({
            userId,
            userName
        });

        await poll.save();

        res.json({
            success: true,
            poll
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deletePoll = async (req, res) => {

    try {

        const { pollId } = req.params;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        // ✅ Check poll exists
        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        // ✅ Delete from database
        await Poll.findByIdAndDelete(pollId);

        return res.status(200).json({
            success: true,
            message: "Poll deleted successfully",
        });

    } catch (error) {

        console.error("Delete Poll Error:", error);

        return res.status(500).json({
            message: "Server error while deleting poll",
        });
    }
};

module.exports = {
    createPoll,
    getPolls,
    votePoll,
    deletePoll
};