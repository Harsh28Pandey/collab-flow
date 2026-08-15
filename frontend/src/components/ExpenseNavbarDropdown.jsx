import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Wallet, Plus, PiggyBank, BarChart3, ChevronDown,
} from "lucide-react";

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

    const isAnySubActive = EXPENSE_SUBTABS.some(t => location.pathname === t.path);
    const [open, setOpen] = useState(isAnySubActive);

    useEffect(() => {
        if (isAnySubActive) setOpen(true);
    }, [location.pathname]);

    const isParentActive = isAnySubActive;

    return (
        <div ref={containerRef} className="w-full select-none">
            {/* PARENT: Expenses */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                className={`cursor-pointer w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl
                    text-sm font-mono font-medium transition-all
                    ${isParentActive
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                        : "text-zinc-400 hover:bg-zinc-900/80 hover:text-white border border-transparent"}`}
            >
                <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border border-white/5
                        ${isParentActive ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-zinc-900 text-zinc-400"}`}>
                        <Wallet size={15} />
                    </span>
                    <span className="truncate tracking-wide">Expenses</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"} ${isParentActive ? "text-cyan-400" : "text-zinc-500"}`}
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
                                    font-mono font-medium transition-all text-left w-full
                                    ${active
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 border border-transparent"}`}
                            >
                                <Icon size={14} className={active ? "text-cyan-400" : "text-zinc-500"} />
                                <span className="truncate tracking-wide">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ExpenseNavDropdown;