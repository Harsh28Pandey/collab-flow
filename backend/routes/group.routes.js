const express = require("express");

const { createGroup, getMyGroups, getSingleGroup, addMember, removeMember, leaveGroup, joinViaCode, deleteGroup, updateGroup } = require("../controllers/group.controller");

const { protect } = require("../middlewares/auth.middleware");

const { groupMemberOnly, groupAdminOnly } = require("../middlewares/group.middleware");

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", protect, getMyGroups);
router.post("/join/:code", protect, joinViaCode);
router.get("/:groupId", protect, groupMemberOnly, getSingleGroup);
router.post("/:groupId/members", protect, groupAdminOnly, addMember);
router.put("/:groupId", protect, groupAdminOnly, updateGroup);
router.delete("/:groupId/members/:memberId", protect, groupAdminOnly, removeMember);
router.put("/:groupId/leave", protect, groupMemberOnly, leaveGroup);
router.delete("/:groupId", protect, groupAdminOnly, deleteGroup);

// router.put("/:groupId/role",protect,groupAdminOnly,updateRole);

module.exports = router;