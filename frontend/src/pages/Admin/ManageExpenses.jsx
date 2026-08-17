import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext.jsx"; // ✅ Import kiya
import {
    EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODES,
    formatCurrency, fmtDate,
} from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, Search, Download, Pencil, Trash2, X,
    ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown,
    Receipt, ArrowUpDown, CheckCircle2, AlertCircle, Loader2, Filter,
    FolderOpen, Layers, ChevronDown, ChevronUp
} from "lucide-react";
import ExpenseNavDropdown from "../../components/ExpenseNavbarDropdown.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const StatSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
        {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-[76px] rounded-2xl" />)}
    </div>
);

const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 mt-4">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-[72px] rounded-[2rem]" />)}
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
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-sm font-mono font-bold backdrop-blur-xl
                ${ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                {ok ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
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
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 animate-[modalPop_.2s_ease] relative overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Top Ambient Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Trash2 size={20} className="text-rose-400" />
                </div>
                <h3 className="text-base font-mono font-black text-white text-center tracking-wide">Delete this expense?</h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 text-center mt-1.5 leading-relaxed">
                    "{expense.title}" ({formatCurrency(expense.amount)}) will be permanently removed.
                </p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                    <button type="button" onClick={onClose} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono font-bold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg active:scale-95">
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 transition px-4 py-3 shadow-inner">
        <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-mono font-bold text-white truncate">{exp.title}</p>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                {fmtDate(exp.date)} · {exp.paymentMode}{exp.vendor ? ` · ${exp.vendor}` : ""}
            </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
            <p className="text-sm font-mono font-black text-white whitespace-nowrap">{formatCurrency(exp.amount)}</p>
            <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => onEdit(exp)} title="Edit expense" aria-label="Edit expense"
                    className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center shrink-0 transition shadow-inner active:scale-95">
                    <Pencil size={13} />
                </button>
                <button type="button" onClick={() => onDelete(exp)} title="Delete expense" aria-label="Delete expense"
                    className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-rose-400 flex items-center justify-center shrink-0 transition shadow-inner active:scale-95">
                    <Trash2 size={13} />
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
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <button type="button" onClick={onToggle}
                className="cursor-pointer w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-900/40 transition text-left outline-none">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                        <Icon size={16} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-mono font-bold text-white truncate tracking-wide">{category}</p>
                        <p className="text-[11px] font-mono text-zinc-400">{items.length} expense{items.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <p className="text-sm sm:text-base font-mono font-black text-cyan-400 whitespace-nowrap">{formatCurrency(total)}</p>
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                        {collapsed ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronUp size={16} className="text-cyan-400" />}
                    </div>
                </div>
            </button>

            {!collapsed && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 border-t border-white/5 pt-4 bg-zinc-950/40">
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
    const { user } = useContext(UserContext); // ✅ UserContext se Admin data lia

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
            
            // ✅ EXACT FILTER: Sirf Current Admin/Team ka Data aayega
            const adminExpenses = raw.filter(exp => {
                if (!user) return false;
                return exp.teamCode === user.teamCode || 
                       exp.createdBy === user._id || 
                       exp.createdBy?._id === user._id ||
                       exp.user === user._id ||
                       exp.user?._id === user._id;
            });

            setExpenses(adminExpenses);

        } catch (e) {
            console.log(e);
            showToast("Couldn't load expenses. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]); // User state dependency mein daal di gayi hai

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

    // Inline style injections for animations
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .animate-shimmer { animation: shimmer 2s infinite linear; }
            @keyframes modalPop { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
            @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn .2s ease; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <DashboardLayout activeMenu="Manage Expenses">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Manage Expenses</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">All expenses grouped by category — edit or remove anything</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchExpenses({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={() => navigate("/admin/add-expense")}
                                className="relative cursor-pointer h-11 px-5 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95">
                                <Plus size={16} className="text-cyan-400 stroke-[3]" />
                                Create Expense
                            </button>
                        </div>
                    </div>
                </div>

                {/* STAT CARDS */}
                {loading ? <StatSkeleton /> : (
                    <>
                        {hasData && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-blue-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Receipt size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Expenses</p>
                                        <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{stats.totalExpenses}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-indigo-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><FolderOpen size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Categories</p>
                                        <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{stats.totalCategories}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden col-span-2 sm:col-span-1">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Layers size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Total Amount</p>
                                        <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(stats.totalAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEARCH + EXPAND/COLLAPSE ALL */}
                        {hasData && (
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center py-2">
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search by title, vendor, category or payment mode..."
                                        className="w-full h-12 pl-11 pr-10 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner" />
                                    {searchQuery && (
                                        <button type="button" onClick={() => setSearchQuery("")}
                                            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-xl hover:bg-zinc-800 flex items-center justify-center transition">
                                            <X size={14} className="text-zinc-400 hover:text-white" />
                                        </button>
                                    )}
                                </div>
                                <button type="button" onClick={toggleAll} disabled={grouped.length === 0}
                                    className="cursor-pointer h-12 px-5 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 hover:text-white text-xs sm:text-sm font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-inner shrink-0 sm:w-auto w-full">
                                    {allCollapsed ? <ChevronDown size={16} className="text-cyan-400" /> : <ChevronUp size={16} className="text-cyan-400" />}
                                    {allCollapsed ? "Expand All" : "Collapse All"}
                                </button>
                            </div>
                        )}

                        {/* RESULTS COUNT */}
                        {hasData && (
                            <p className="text-xs sm:text-sm font-mono text-zinc-400 px-1">
                                {filtered.length} expense{filtered.length !== 1 ? "s" : ""} across <span className="font-bold text-white">{grouped.length}</span> categor{grouped.length !== 1 ? "ies" : "y"}
                                {searchQuery && <span> matching "<span className="font-bold text-cyan-400">{searchQuery}</span>"</span>}
                            </p>
                        )}

                        {/* GROUPED LIST */}
                        {!hasData ? (
                            <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                                    <Receipt size={36} className="text-cyan-400" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">No expenses yet</h3>
                                <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                                    Add your first expense to start tracking and organizing spend by category.
                                </p>
                                <div className="relative group cursor-pointer mt-6">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                    <button type="button" onClick={() => navigate("/admin/add-expense")}
                                        className="relative cursor-pointer h-12 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-lg">
                                        <Plus size={16} className="text-cyan-400 stroke-[3]" /> Create Expense
                                    </button>
                                </div>
                            </div>
                        ) : grouped.length === 0 ? (
                            <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-16 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
                                    <Search size={26} className="text-zinc-500" />
                                </div>
                                <h3 className="text-base sm:text-lg font-mono font-bold text-white">No matching expenses</h3>
                                <p className="text-xs font-mono text-zinc-500 mt-1">Try a different search term.</p>
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

        </DashboardLayout>
    );
};

export default ManageExpenses;