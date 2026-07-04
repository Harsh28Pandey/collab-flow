const Budget = require("../models/budget.model.js");
const Expense = require("../models/expense.model.js");

// @desc    Create or update the budget for a category+month+year (upsert)
// @route   POST /api/budgets
// @access  Private/Admin
const upsertBudget = async (req, res) => {
    try {
        const { category, month, year, amount, notes } = req.body;
        if (!category || !month || !year || !amount) {
            return res.status(400).json({ message: "Category, month, year and amount are required" });
        }

        const budget = await Budget.findOneAndUpdate(
            { category, month, year },
            { category, month, year, amount, notes: notes || "", createdBy: req.user._id },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ message: "Budget saved successfully", budget });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all budgets for a given month/year, each with computed spend
// @route   GET /api/budgets?month=&year=
// @access  Private/Admin
const getBudgets = async (req, res) => {
    try {
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const year = Number(req.query.year) || new Date().getFullYear();

        const budgets = await Budget.find({ month, year }).sort({ category: 1 });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const spendByCategory = await Expense.aggregate([
            { $match: { date: { $gte: start, $lt: end } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
        ]);
        const spendMap = Object.fromEntries(spendByCategory.map(s => [s._id, s.total]));

        const result = budgets.map(b => {
            const spent = spendMap[b.category] || 0;
            const remaining = b.amount - spent;
            const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
            return {
                _id: b._id,
                category: b.category,
                month: b.month,
                year: b.year,
                amount: b.amount,
                notes: b.notes,
                spent,
                remaining,
                pct,
                status: pct >= 100 ? "Over Budget" : pct >= 80 ? "Near Limit" : "On Track",
            };
        });

        res.status(200).json({ budgets: result, month, year });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private/Admin
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: "Budget not found" });
        await budget.deleteOne();
        res.status(200).json({ message: "Budget deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { upsertBudget, getBudgets, deleteBudget };