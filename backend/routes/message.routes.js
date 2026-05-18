const express = require("express");
const { getMessages, sendMessage, deleteMessage } = require("../controllers/message.controller.js");

const { protect } = require("../middlewares/auth.middleware.js");

const router = express.Router();

//* Send message (admin + user)
router.post("/", protect, sendMessage);

//* Get messages of a group
router.get("/:groupId", protect, getMessages);

//* Delete message (admin or sender)
router.delete("/:messageId", protect, deleteMessage);

module.exports = router;