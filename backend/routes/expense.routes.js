const express = require("express");
// Adjust this import to match your project's real auth middleware path/names
// (the same one used for Task/Timesheet/Event routes).
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const {
    createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense,
    getExpenseSummary, getCategoryBreakdown, getMonthlyTrend,
} = require("../controllers/expense.controller.js");

const router = express.Router();

// Entire expense manager is admin-only, per requirements.
router.get("/summary", protect, adminOnly, getExpenseSummary);
router.get("/by-category", protect, adminOnly, getCategoryBreakdown);
router.get("/monthly-trend", protect, adminOnly, getMonthlyTrend);

router.get("/", protect, adminOnly, getAllExpenses);
router.post("/", protect, adminOnly, createExpense);
router.get("/:id", protect, adminOnly, getExpenseById);
router.put("/:id", protect, adminOnly, updateExpense);
router.delete("/:id", protect, adminOnly, deleteExpense);

module.exports = router;