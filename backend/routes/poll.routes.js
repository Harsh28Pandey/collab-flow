const express = require("express");
const { createPoll, getPolls, votePoll, deletePoll } = require("../controllers/poll.controller.js");
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");

const router = express.Router();

//* only logged-in users
router.get("/", protect, getPolls);

//* only logged-in users can vote
router.post("/vote", protect, votePoll);

//* only ADMIN can create poll
router.post("/create", protect, adminOnly, createPoll);

//* only admin to delete poll
router.delete("/delete/:pollId", protect, adminOnly, deletePoll);

module.exports = router;