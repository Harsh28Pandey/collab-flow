const mongoose = require("mongoose");
const Expense = require("../models/expense.model.js");

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = async (req, res) => {
    try {
        const { title, amount, category, date, paymentMode, vendor, notes, isRecurring, recurringFrequency } = req.body;

        if (!title || !amount || !category || !date || !paymentMode) {
            return res.status(400).json({ message: "Title, amount, category, date and payment mode are required" });
        }
        if (isRecurring && !recurringFrequency) {
            return res.status(400).json({ message: "Select a recurring frequency" });
        }

        const expense = await Expense.create({
            title, amount, category, date, paymentMode,
            vendor: vendor || "", notes: notes || "",
            isRecurring: !!isRecurring,
            recurringFrequency: isRecurring ? recurringFrequency : null,
            createdBy: req.user._id,
        });

        res.status(201).json({ message: "Expense added successfully", expense });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all expenses (filtering/sorting/search done client-side, same as Tasks)
// @route   GET /api/expenses
// @access  Private/Admin
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().populate("createdBy", "name email").sort({ date: -1, createdAt: -1 });
        res.status(200).json({ expenses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private/Admin
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json({ expense });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });

        const { title, amount, category, date, paymentMode, vendor, notes, isRecurring, recurringFrequency } = req.body;
        if (!title || !amount || !category || !date || !paymentMode) {
            return res.status(400).json({ message: "Title, amount, category, date and payment mode are required" });
        }

        expense.title = title;
        expense.amount = amount;
        expense.category = category;
        expense.date = date;
        expense.paymentMode = paymentMode;
        expense.vendor = vendor || "";
        expense.notes = notes || "";
        expense.isRecurring = !!isRecurring;
        expense.recurringFrequency = isRecurring ? recurringFrequency : null;

        const updated = await expense.save();
        res.status(200).json({ message: "Expense updated successfully", expense: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        await expense.deleteOne();
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    High-level summary stats (used by Expenses list header + Analytics)
// @route   GET /api/expenses/summary
// @access  Private/Admin
const getExpenseSummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const [overall, thisMonth, lastMonth, byPaymentMode, topCategory] = await Promise.all([
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 }, avg: { $avg: "$amount" } } },
            ]),
            Expense.aggregate([
                { $match: { date: { $gte: startOfThisMonth, $lt: startOfNextMonth } } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Expense.aggregate([
                { $match: { date: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Expense.aggregate([
                { $group: { _id: "$paymentMode", total: { $sum: "$amount" }, count: { $sum: 1 } } },
                { $sort: { total: -1 } },
            ]),
            Expense.aggregate([
                { $group: { _id: "$category", total: { $sum: "$amount" } } },
                { $sort: { total: -1 } },
                { $limit: 1 },
            ]),
        ]);

        res.status(200).json({
            total: overall[0]?.total || 0,
            count: overall[0]?.count || 0,
            avg: overall[0]?.avg || 0,
            thisMonth: thisMonth[0]?.total || 0,
            thisMonthCount: thisMonth[0]?.count || 0,
            lastMonth: lastMonth[0]?.total || 0,
            lastMonthCount: lastMonth[0]?.count || 0,
            byPaymentMode,
            topCategory: topCategory[0]?._id || null,
            topCategoryTotal: topCategory[0]?.total || 0,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Category-wise breakdown (optionally scoped to a month/year)
// @route   GET /api/expenses/by-category?month=&year=
// @access  Private/Admin
const getCategoryBreakdown = async (req, res) => {
    try {
        const { month, year } = req.query;
        const match = {};
        if (month && year) {
            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);
            match.date = { $gte: start, $lt: end };
        }

        const breakdown = await Expense.aggregate([
            ...(Object.keys(match).length ? [{ $match: match }] : []),
            { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
        ]);

        res.status(200).json({ breakdown });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Monthly spend trend for the last N months (default 6)
// @route   GET /api/expenses/monthly-trend?months=6
// @access  Private/Admin
const getMonthlyTrend = async (req, res) => {
    try {
        const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

        const trend = await Expense.aggregate([
            { $match: { date: { $gte: start } } },
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // fill in months with zero spend so the chart never has gaps
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const found = trend.find(t => t._id.year === d.getFullYear() && t._id.month === d.getMonth() + 1);
            result.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                total: found?.total || 0,
                count: found?.count || 0,
            });
        }

        res.status(200).json({ trend: result });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense,
    getExpenseSummary, getCategoryBreakdown, getMonthlyTrend,
};