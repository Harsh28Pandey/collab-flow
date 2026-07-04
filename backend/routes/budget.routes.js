const express = require("express");
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const { upsertBudget, getBudgets, deleteBudget } = require("../controllers/budget.controller.js");

const router = express.Router();

router.get("/", protect, adminOnly, getBudgets);
router.post("/", protect, adminOnly, upsertBudget);
router.delete("/:id", protect, adminOnly, deleteBudget);

module.exports = router;