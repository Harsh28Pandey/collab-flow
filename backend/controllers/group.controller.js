const Group = require("../models/group.model.js");
const Message = require("../models/message.model.js");

const createGroup = async (req, res) => {

    try {

        const {
            name,
            description,
            members
        } = req.body;

        // UNIQUE MEMBERS
        const uniqueMembers = [
            ...new Set([
                ...(members || []),
                req.user.id
            ])
        ];

        // FORMAT MEMBERS
        const formattedMembers =
            uniqueMembers.map((id) => ({
                user: id,
                role:
                    id === req.user.id
                        ? "admin"
                        : "member"
            }));

        // CREATE GROUP
        const group = await Group.create({

            name,

            description: description || "",

            // IMPORTANT
            admin: req.user.id,

            members: formattedMembers,

            teamCode: req.user.teamCode,

            inviteCode: Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()
        });

        // POPULATE
        const populatedGroup =
            await Group.findById(group._id)
                .populate(
                    "members.user",
                    "_id name email profileImageUrl"
                )
                .populate(
                    "admin",
                    "_id name email profileImageUrl"
                );

        res.status(201).json(
            populatedGroup
        );

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
};

const getMyGroups = async (req, res) => {

    try {

        const groups = await Group.find({

            "members.user": req.user.id,

            teamCode: req.user.teamCode,

        })
            .populate(
                "members.user",
                "name email profileImageUrl"
            );

        res.status(200).json(groups);

    } catch (err) {

        console.log("GET GROUP ERROR:", err);

        res.status(500).json({
            message: err.message,
        });
    }
};

const addMember = async (req, res) => {
    try {

        const { userId } = req.body;
        const { groupId } = req.params;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isAdmin = group.members.find(
            (m) =>
                m.user.toString() === req.user.id &&
                m.role === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({
                message: "Only admin can add members"
            });
        }

        const isMember = group.members.some(
            (member) =>
                member.user.toString() === userId
        );

        if (isMember) {
            return res.status(400).json({
                message: "User already in group"
            });
        }

        group.members.push({
            user: userId,
            role: "member"
        });

        await group.save();

        res.json(group);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeMember = async (req, res) => {
    try {

        const { groupId, memberId } = req.params;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const isAdmin = group.members.find(
            (m) =>
                m.user.toString() === req.user.id &&
                m.role === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({
                message: "Only admin can remove members"
            });
        }

        const isMember = group.members.some(
            (m) =>
                m.user.toString() === memberId
        );

        if (!isMember) {
            return res.status(400).json({
                message: "User not in group"
            });
        }

        group.members = group.members.filter(
            (m) =>
                m.user.toString() !== memberId
        );

        await group.save();

        res.json({
            message: "Member removed successfully"
        });

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
        const isAdmin = group.members.find(
            (m) =>
                m.user.toString() === req.user.id &&
                m.role === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({
                message: "Only admin can perform this action"
            });
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

const getSingleGroup = async (req, res) => {

    try {

        const { groupId } = req.params;

        const group = await Group.findById(groupId)

            .populate("members.user", "_id name email");

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const isMember = group.members.some((member) =>
            (member.user._id || member.user).toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not member of this group"
            });
        }

        res.json(group);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};

const leaveGroup = async (req, res) => {
    try {

        const { groupId } = req.params;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        // admin cannot leave
        const isAdmin = group.members.find(
            (m) =>
                m.user.toString() === req.user.id &&
                m.role === "admin"
        );

        if (isAdmin) {
            return res.status(400).json({
                message: "Admin cannot leave group"
            });
        }

        group.members = group.members.filter(
            (m) =>
                m.user.toString() !== req.user.id
        );

        await group.save();

        res.json({
            message: "Left group successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const updateGroup = async (req, res) => {

    try {

        const { groupId } = req.params;

        const {
            name,
            description,
            members,
        } = req.body;

        const group = await Group.findById(
            groupId
        );

        if (!group) {

            return res.status(404).json({
                message: "Group not found",
            });
        }

        // FIND ADMIN
        const adminMember =
            group.members.find(
                (member) =>
                    member.role === "admin"
            );

        if (!adminMember) {

            return res.status(400).json({
                message:
                    "Admin not found in group",
            });
        }

        // ADMIN CHECK
        if (
            adminMember.user.toString() !==
            req.user.id
        ) {

            return res.status(403).json({
                message:
                    "Only admin can update group",
            });
        }

        // UPDATE NAME
        if (name) {

            group.name = name;
        }

        // UPDATE DESCRIPTION
        if (description !== undefined) {

            group.description =
                description;
        }

        // UPDATE MEMBERS
        if (Array.isArray(members)) {

            group.members =
                members.map((id) => ({

                    user: id,

                    role:
                        id === req.user.id
                            ? "admin"
                            : "member",
                }));
        }

        await group.save();

        const updatedGroup =
            await Group.findById(group._id)
                .populate(
                    "members.user",
                    "name email profileImageUrl"
                );

        res.status(200).json(
            updatedGroup
        );

    } catch (err) {

        console.log(
            "UPDATE GROUP ERROR:",
            err
        );

        res.status(500).json({
            message: err.message,
        });
    }
};

const joinViaCode = async (req, res) => {

    try {

        const { code } = req.params;

        const group = await Group.findOne({
            inviteCode: code
        });

        if (!group) {
            return res.status(404).json({
                message: "Invalid invite code"
            });
        }

        //* already member
        const alreadyMember = group.members.some(
            (id) => id.toString() === req.user.id
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: "Already member"
            });
        }

        group.members.push({
            user: req.user.id,
            role: "member"
        });

        await group.save();

        res.json({
            message: "Joined successfully",
            group
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};

module.exports = { createGroup, getMyGroups, addMember, removeMember, deleteGroup, getSingleGroup, leaveGroup, updateGroup, joinViaCode }; 