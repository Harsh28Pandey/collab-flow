const mongoose = require("mongoose");

const EXPENSE_CATEGORIES = [
    "Travel", "Food & Dining", "Office Supplies", "Software & Subscriptions",
    "Utilities", "Marketing", "Salaries & Wages", "Rent", "Equipment", "Miscellaneous",
];

const PAYMENT_MODES = ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Cheque"];

const ExpenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Expense title is required"],
            trim: true,
            maxlength: 150,
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0.01, "Amount must be greater than 0"],
        },
        category: {
            type: String,
            enum: EXPENSE_CATEGORIES,
            required: [true, "Category is required"],
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
        },
        paymentMode: {
            type: String,
            enum: PAYMENT_MODES,
            required: [true, "Payment mode is required"],
        },
        vendor: {
            type: String,
            trim: true,
            maxlength: 150,
            default: "",
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringFrequency: {
            type: String,
            enum: ["Weekly", "Monthly", "Yearly", null],
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.PAYMENT_MODES = PAYMENT_MODES;