import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Wallet, Plus, PiggyBank, BarChart3, ChevronDown,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSES DROPDOWN NAV ITEM
// Sidebar me "Expenses" par click karte hi yeh dropdown open hoga aur
// 4 sub-tabs dikhayega: Manage Expenses, Add Expense, Budget, Expense Analytics.
// Jis tab par click karoge, usi route par navigate ho jayega.
// ─────────────────────────────────────────────────────────────────────────────

// 👇 Apne actual routes yahan set karo (jo App.jsx / routes file me define hain)
const EXPENSE_SUBTABS = [
    { label: "Manage Expenses", path: "/admin/expenses", icon: Wallet },
    { label: "Add Expense", path: "/admin/add-expense", icon: Plus },
    { label: "Budget", path: "/admin/budget", icon: PiggyBank },
    { label: "Expense Analytics", path: "/admin/expense-analytics", icon: BarChart3 },
];

const ExpenseNavDropdown = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);

    // Agar current URL kisi bhi sub-tab se match karta hai to dropdown
    // by default open rahega, taki user ko pata rahe wo kis tab me hai.
    const isAnySubActive = EXPENSE_SUBTABS.some(t => location.pathname === t.path);
    const [open, setOpen] = useState(isAnySubActive);

    // Route change hone par bhi open state sync rakho
    useEffect(() => {
        if (isAnySubActive) setOpen(true);
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // Bahar click karne par mobile drawer me dropdown band karna ho to (optional)
    // Agar tumhara sidebar khud hi outside click par close hota hai to isko chhod do.

    const isParentActive = isAnySubActive;

    return (
        <div ref={containerRef} className="w-full select-none">
            {/* PARENT: Expenses */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                className={`cursor-pointer w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl
                    text-sm font-medium transition-all
                    ${isParentActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
                <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0
                        ${isParentActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Wallet size={15} />
                    </span>
                    <span className="truncate">Expenses</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                />
            </button>

            {/* SUBMENU — smooth expand/collapse, fully responsive */}
            <div
                className="overflow-hidden transition-all duration-250 ease-in-out"
                style={{
                    maxHeight: open ? `${EXPENSE_SUBTABS.length * 48 + 16}px` : "0px",
                    opacity: open ? 1 : 0,
                }}
            >
                <div className="pl-3 sm:pl-4 pt-1.5 pb-1 flex flex-col gap-1">
                    {EXPENSE_SUBTABS.map(({ label, path, icon: Icon }) => {
                        const active = location.pathname === path;
                        return (
                            <button
                                key={path}
                                type="button"
                                onClick={() => navigate(path)}
                                className={`cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] sm:text-sm
                                    font-medium transition-all text-left w-full
                                    ${active
                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
                            >
                                <Icon size={14} className={active ? "text-white" : "text-gray-400"} />
                                <span className="truncate">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ExpenseNavDropdown;