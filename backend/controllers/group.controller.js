const Group = require("../models/group.model.js");
const Message = require("../models/message.model.js");

const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;

        const group = await Group.create({
            name,
            admin: req.user.id,
            members: [...members, req.user.id],
            teamCode: req.user.teamCode
        });

        const populatedGroup = await Group.findById(group._id)
            .populate("members", "_id name email")
            .populate("admin", "_id name email");

        res.json(populatedGroup);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            members: req.user.id,
            teamCode: req.user.teamCode
        }).populate("members", "name email");

        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        const group = await Group.findById(groupId);

        //* group exist check
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        //* admin check
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        //* already member check (safe way)
        const isMember = group.members.some(
            (id) => id.toString() === userId
        );

        if (isMember) {
            return res.status(400).json({ message: "User already in group" });
        }

        //* add member
        group.members.push(userId);
        await group.save();

        //* populated response
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "_id name email")
            .populate("admin", "_id name email");

        res.json(updatedGroup);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        //* group check
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }

        //* admin check
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can remove members" });
        }

        //* admin cannot remove himself
        if (group.admin.toString() === userId) {
            return res.status(400).json({ message: "Admin cannot remove himself" });
        }

        //* check user is in group
        const isMember = group.members.some(
            (id) => id.toString() === userId
        );

        if (!isMember) {
            return res.status(400).json({ message: "User not in group" });
        }

        //* remove member
        group.members = group.members.filter(
            (id) => id.toString() !== userId
        );

        await group.save();

        //* populated response
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "_id name email")
            .populate("admin", "_id name email");

        res.json(updatedGroup);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        //* check group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.teamCode !== req.user.teamCode) {
            return res.status(403).json({ message: "Not authorized" });
        }


        //* admin check
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only admin can delete this group" });
        }

        //* delete all messages of this group
        await Message.deleteMany({ group: groupId });

        //* delete group
        await group.deleteOne();

        res.json({ message: "Group and all messages deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { createGroup, getMyGroups, addMember, removeMember, deleteGroup }; 