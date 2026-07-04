const mongoose = require("mongoose");
const { EXPENSE_CATEGORIES } = require("../models/expense.model.js");

const BudgetSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: EXPENSE_CATEGORIES,
            required: [true, "Category is required"],
        },
        month: {
            type: Number, // 1-12
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        amount: {
            type: Number,
            required: [true, "Budget amount is required"],
            min: [0.01, "Budget amount must be greater than 0"],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// one budget per category per month/year
BudgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);