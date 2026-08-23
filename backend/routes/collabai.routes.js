const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware.js");

const {
    askCollabAiController,
    getMyCollabHistory,
    clearMyCollabHistory,
    updateMessageController,
    deleteMessageController,
} = require("../controllers/collabai.controller.js");

// POST   /api/collab-ai/ask              -> ask a question, saves Q&A to DB
//                                            (member: own data only | admin: own + own-team data)
// GET    /api/collab-ai/history          -> this account's own past messages only
// DELETE /api/collab-ai/clear            -> wipe this account's own conversation
// PUT    /api/collab-ai/message/:id      -> edit a past user question, regenerates the answer
// DELETE /api/collab-ai/message/:id      -> delete a single message from own conversation
//
// No route here accepts or looks up any id other than req.user._id for
// the chat itself, and admin's team data is always re-derived server-side
// from req.user.teamCode — never from anything the client sends. This is
// what makes cross-account / cross-team access structurally impossible.
router.post("/ask", protect, askCollabAiController);
router.get("/history", protect, getMyCollabHistory);
router.delete("/clear", protect, clearMyCollabHistory);
router.put("/message/:messageId", protect, updateMessageController);
router.delete("/message/:messageId", protect, deleteMessageController);

module.exports = router;