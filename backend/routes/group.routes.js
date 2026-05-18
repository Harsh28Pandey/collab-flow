const express = require("express");
const { createGroup, getMyGroups, addMember, removeMember, deleteGroup } = require("../controllers/group.controller.js");

const { protect, adminOnly } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/", protect, adminOnly, createGroup);
router.get("/", protect, getMyGroups);
router.put("/add", protect, adminOnly, addMember);
router.put("/remove", protect, adminOnly, removeMember);
router.delete("/:groupId", protect, deleteGroup);

module.exports = router;