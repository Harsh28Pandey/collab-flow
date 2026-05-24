const Group = require("../models/group.model.js");

const groupMemberOnly = async (req, res, next) => {

    try {

        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const isMember = group.members.some(
            member =>
                member.user.toString() === req.user.id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        req.group = group;

        next();

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const groupAdminOnly = async (req, res, next) => {

    try {

        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const admin = group.members.find(
            member =>
                member.user.toString() === req.user.id.toString()
        );

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        req.group = group;

        next();

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    groupMemberOnly,
    groupAdminOnly
};