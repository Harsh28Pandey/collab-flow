import {
    Plane, UtensilsCrossed, Package, Laptop2, Zap, Megaphone,
    Users, Building2, Wrench, MoreHorizontal, Banknote, CreditCard,
    Wallet, Landmark, ScrollText,
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
    "Travel", "Food & Dining", "Office Supplies", "Software & Subscriptions",
    "Utilities", "Marketing", "Salaries & Wages", "Rent", "Equipment", "Miscellaneous",
];

export const CATEGORY_STYLE = {
    "Travel": { icon: Plane, solid: "bg-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    "Food & Dining": { icon: UtensilsCrossed, solid: "bg-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    "Office Supplies": { icon: Package, solid: "bg-teal-600", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
    "Software & Subscriptions": { icon: Laptop2, solid: "bg-indigo-600", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
    "Utilities": { icon: Zap, solid: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    "Marketing": { icon: Megaphone, solid: "bg-purple-600", badge: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    "Salaries & Wages": { icon: Users, solid: "bg-cyan-600", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
    "Rent": { icon: Building2, solid: "bg-slate-600", badge: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-500" },
    "Equipment": { icon: Wrench, solid: "bg-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    "Miscellaneous": { icon: MoreHorizontal, solid: "bg-gray-500", badge: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-400" },
};

export const PAYMENT_MODES = ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Cheque"];

export const PAYMENT_MODE_ICON = {
    "Cash": Banknote,
    "Credit Card": CreditCard,
    "Debit Card": CreditCard,
    "UPI": Wallet,
    "Bank Transfer": Landmark,
    "Cheque": ScrollText,
};

export const RECURRING_FREQUENCIES = ["Weekly", "Monthly", "Yearly"];

export const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const formatCurrencyPrecise = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);

export const fmtDate = (d, opts) => new Date(d).toLocaleDateString("en-IN", opts || { day: "numeric", month: "short", year: "numeric" });

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

export const toInputDate = (d) => {
    const dt = new Date(d);
    const p = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
};