const Message = require("../models/message.model.js");
const Group = require("../models/group.model.js");

//* SEND MESSAGE (admin + user both)
const sendMessage = async (req, res) => {
    try {
        const { groupId, text } = req.body;

        //* group check
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        //* check member (admin bhi member hota hai)
        const isMember = group.members.some(
            (id) => id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: "You are not in this group" });
        }

        //* create message
        const message = await Message.create({
            group: groupId,
            sender: req.user.id,
            text
        });

        //* populate sender
        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "_id name email");

        res.status(201).json(populatedMessage);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//* GET MESSAGES (only group members)
const getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        //* group check
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        //* check user is member
        const isMember = group.members.some(
            (id) => id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const messages = await Message.find({ group: groupId })
            .populate("sender", "_id name email")
            .sort({ createdAt: 1 });

        res.json(messages);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//* DELETE MESSAGE
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const group = await Group.findById(message.group);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        //* check member
        const isMember = group.members.some(
            (id) => id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        //* admin or sender
        const isAdmin = group.admin.toString() === req.user.id;
        const isSender = message.sender.toString() === req.user.id;

        if (!isAdmin && !isSender) {
            return res.status(403).json({
                message: "Not allowed to delete this message"
            });
        }

        await message.deleteOne();

        res.json({ message: "Message deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    deleteMessage
};