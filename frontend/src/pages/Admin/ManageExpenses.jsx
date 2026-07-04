import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { EXPENSE_CATEGORIES, CATEGORY_STYLE, formatCurrency, fmtDate } from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, Search, Pencil, Trash2, X, ChevronDown, ChevronUp,
    Receipt, Layers, CheckCircle2, AlertCircle, Loader2, FolderOpen,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-[68px] bg-gray-100 rounded-2xl" />)}
        </div>
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-5 space-y-3">
                <div className="h-6 w-40 bg-gray-200 rounded-lg" />
                {[...Array(2)].map((_, j) => <div key={j} className="h-16 bg-gray-100 rounded-2xl" />)}
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3200);
        return () => clearTimeout(t);
    }, [toast, onClose]);
    if (!toast) return null;
    const ok = toast.type === "success";
    return (
        <div className="fixed top-5 right-5 z-[10001] animate-[toastIn_.25s_ease]">
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-sm font-medium
                ${ok ? "bg-blue-600 border-blue-700 text-white" : "bg-red-600 border-red-700 text-white"}`}>
                {ok ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/20 flex items-center justify-center">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmDeleteModal = ({ expense, onClose, onConfirm, deleting }) => {
    if (!expense) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-[26px] shadow-2xl p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center">Delete this expense?</h3>
                <p className="text-sm text-gray-500 text-center mt-1.5">
                    "{expense.title}" ({formatCurrency(expense.amount)}) will be permanently removed.
                </p>
                <div className="flex items-center gap-3 mt-6">
                    <button type="button" onClick={onClose} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
                        {deleting && <Loader2 size={15} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE ROW (inside a category group)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseRow = ({ exp, onEdit, onDelete }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 transition px-4 py-3">
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
                {fmtDate(exp.date)} · {exp.paymentMode}{exp.vendor ? ` · ${exp.vendor}` : ""}
            </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
            <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(exp.amount)}</p>
            <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => onEdit(exp)} title="Edit expense" aria-label="Edit expense"
                    className="cursor-pointer h-9 w-9 rounded-2xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 flex items-center justify-center transition">
                    <Pencil size={14} className="text-blue-600" />
                </button>
                <button type="button" onClick={() => onDelete(exp)} title="Delete expense" aria-label="Delete expense"
                    className="cursor-pointer h-9 w-9 rounded-2xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 active:bg-red-100 flex items-center justify-center transition">
                    <Trash2 size={14} className="text-red-600" />
                </button>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY GROUP (collapsible)
// ─────────────────────────────────────────────────────────────────────────────

const CategoryGroup = ({ category, items, collapsed, onToggle, onEdit, onDelete }) => {
    const style = CATEGORY_STYLE[category] || CATEGORY_STYLE.Miscellaneous;
    const Icon = style.icon;
    const total = items.reduce((s, e) => s + (e.amount || 0), 0);

    return (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
            <button type="button" onClick={onToggle}
                className="cursor-pointer w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50/80 transition text-left">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                        <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{category}</p>
                        <p className="text-xs text-gray-400">{items.length} expense{items.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm sm:text-base font-extrabold text-gray-900 whitespace-nowrap">{formatCurrency(total)}</p>
                    {collapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
                </div>
            </button>

            {!collapsed && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 border-t border-gray-100 pt-4">
                    {items.map(exp => (
                        <ExpenseRow key={exp._id} exp={exp} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MANAGE EXPENSES PAGE
// ─────────────────────────────────────────────────────────────────────────────

const ManageExpenses = () => {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [collapsedMap, setCollapsedMap] = useState({});

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchExpenses = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await axiosInstance.get(API_PATHS.EXPENSES.GET_ALL);
            const raw = res.data?.expenses || res.data || [];
            setExpenses(Array.isArray(raw) ? raw : []);
        } catch (e) {
            console.log(e);
            showToast("Couldn't load expenses. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    // ── SEARCH ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return expenses;
        return expenses.filter(exp =>
            (exp.title || "").toLowerCase().includes(q) ||
            (exp.vendor || "").toLowerCase().includes(q) ||
            (exp.notes || "").toLowerCase().includes(q) ||
            (exp.category || "").toLowerCase().includes(q) ||
            (exp.paymentMode || "").toLowerCase().includes(q)
        );
    }, [expenses, searchQuery]);

    // ── GROUP BY CATEGORY ──────────────────────────────────────────────────
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(exp => {
            const cat = exp.category || "Miscellaneous";
            if (!map[cat]) map[cat] = [];
            map[cat].push(exp);
        });
        Object.values(map).forEach(list => list.sort((a, b) => new Date(b.date) - new Date(a.date)));
        // keep a stable, meaningful order (matches EXPENSE_CATEGORIES), then any leftover categories
        const orderedKeys = [...EXPENSE_CATEGORIES.filter(c => map[c]), ...Object.keys(map).filter(c => !EXPENSE_CATEGORIES.includes(c))];
        return orderedKeys.map(cat => ({ category: cat, items: map[cat] }));
    }, [filtered]);

    const toggleCategory = (cat) => setCollapsedMap(m => ({ ...m, [cat]: !m[cat] }));
    const allCollapsed = grouped.length > 0 && grouped.every(g => collapsedMap[g.category]);
    const toggleAll = () => {
        const next = {};
        grouped.forEach(g => { next[g.category] = !allCollapsed; });
        setCollapsedMap(next);
    };

    // ── STATS ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        totalExpenses: filtered.length,
        totalAmount: filtered.reduce((s, e) => s + (e.amount || 0), 0),
        totalCategories: grouped.length,
    }), [filtered, grouped]);

    // ── DELETE ─────────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await axiosInstance.delete(API_PATHS.EXPENSES.DELETE(deleteTarget._id));
            showToast("Expense deleted");
            setDeleteTarget(null);
            fetchExpenses({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't delete expense.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const hasData = expenses.length > 0;

    return (
        <DashboardLayout activeMenu="Manage Expenses">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Expenses</h1>
                        <p className="text-sm text-gray-500 mt-1">All expenses grouped by category — edit or remove anything</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchExpenses({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 w-11 sm:w-auto sm:px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button type="button" onClick={() => navigate("/admin/add-expense")}
                            className="cursor-pointer h-11 px-4 sm:px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-blue-200">
                            <Plus size={17} />
                            Create Expense
                        </button>
                    </div>
                </div>

                {loading ? <Skeleton /> : (
                    <>
                        {/* STAT PILLS */}
                        {hasData && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Receipt size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Expenses</p>
                                        <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{stats.totalExpenses}</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><FolderOpen size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Categories</p>
                                        <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{stats.totalCategories}</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 col-span-2 sm:col-span-1">
                                    <div className="h-9 w-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Layers size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Total Amount</p>
                                        <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(stats.totalAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEARCH + EXPAND/COLLAPSE ALL */}
                        {hasData && (
                            <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search by title, vendor, category or payment mode..."
                                        className="w-full h-10 pl-10 pr-10 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                    {searchQuery && (
                                        <button type="button" onClick={() => setSearchQuery("")}
                                            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                                            <X size={14} className="text-gray-400" />
                                        </button>
                                    )}
                                </div>
                                <button type="button" onClick={toggleAll} disabled={grouped.length === 0}
                                    className="cursor-pointer h-10 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600 text-sm font-medium transition-all flex items-center gap-2 self-start sm:self-auto">
                                    {allCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    {allCollapsed ? "Expand All" : "Collapse All"}
                                </button>
                            </div>
                        )}

                        {/* RESULTS COUNT */}
                        {hasData && (
                            <p className="text-sm text-gray-500 px-1">
                                {filtered.length} expense{filtered.length !== 1 ? "s" : ""} across {grouped.length} categor{grouped.length !== 1 ? "ies" : "y"}
                                {searchQuery && <span> matching "<span className="font-medium text-gray-700">{searchQuery}</span>"</span>}
                            </p>
                        )}

                        {/* GROUPED LIST */}
                        {!hasData ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                                <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <Receipt size={28} className="text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">No expenses yet</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                    Add your first expense to start tracking and organizing spend by category.
                                </p>
                                <button type="button" onClick={() => navigate("/admin/add-expense")}
                                    className="cursor-pointer mt-5 h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2">
                                    <Plus size={16} /> Create Expense
                                </button>
                            </div>
                        ) : grouped.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                                <Search size={28} className="mx-auto text-gray-300 mb-3" />
                                <h3 className="text-lg font-bold text-gray-800">No matching expenses</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Try a different search term.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {grouped.map(({ category, items }) => (
                                    <CategoryGroup
                                        key={category}
                                        category={category}
                                        items={items}
                                        collapsed={!!collapsedMap[category]}
                                        onToggle={() => toggleCategory(category)}
                                        onEdit={(e) => navigate(`/admin/add-expense?id=${e._id}`)}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <ConfirmDeleteModal expense={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
            <Toast toast={toast} onClose={() => setToast(null)} />

            <style>{`
                @keyframes modalPop { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
                @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </DashboardLayout>
    );
};

export default ManageExpenses;