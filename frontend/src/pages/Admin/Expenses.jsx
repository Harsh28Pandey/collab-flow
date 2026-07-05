import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODES,
    formatCurrency, fmtDate,
} from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, Search, Download, Pencil, Trash2, X,
    ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown,
    Receipt, ArrowUpDown, CheckCircle2, AlertCircle, Loader2, Filter,
} from "lucide-react";
import ExpenseNavDropdown from "../../components/ExpenseNavbarDropdown.jsx"

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS
// ─────────────────────────────────────────────────────────────────────────────

const StatSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse">
        {[...Array(5)].map((_, i) => <div key={i} className="h-[68px] bg-gray-100 rounded-2xl" />)}
    </div>
);

const TableSkeleton = () => (
    <div className="animate-pulse space-y-2">
        {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-2xl" />)}
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
// EXPENSE ROW (desktop table)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseTableRow = ({ exp, onEdit, onDelete }) => {
    const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
    const Icon = style.icon;
    return (
        <tr className="hover:bg-gray-50/80 transition">
            <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{fmtDate(exp.date)}</td>
            <td className="py-3 px-4">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                        <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{exp.title}</p>
                        {exp.vendor && <p className="text-xs text-gray-400 truncate max-w-[220px]">{exp.vendor}</p>}
                    </div>
                </div>
            </td>
            <td className="py-3 px-4">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${style.badge} whitespace-nowrap`}>{exp.category}</span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{exp.paymentMode}</td>
            <td className="py-3 px-4 text-sm font-bold text-gray-900 whitespace-nowrap text-right">{formatCurrency(exp.amount)}</td>
            <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1.5">
                    <button type="button" onClick={() => onEdit(exp)} title="Edit expense" aria-label="Edit expense"
                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 flex items-center justify-center transition">
                        <Pencil size={14} className="text-blue-600" />
                    </button>
                    <button type="button" onClick={() => onDelete(exp)} title="Delete expense" aria-label="Delete expense"
                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 active:bg-red-100 flex items-center justify-center transition">
                        <Trash2 size={14} className="text-red-600" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE CARD (mobile)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseCard = ({ exp, onEdit, onDelete }) => {
    const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
    const Icon = style.icon;
    return (
        <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                        <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{exp.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(exp.date)} · {exp.paymentMode}</p>
                    </div>
                </div>
                <p className="text-base font-bold text-gray-900 shrink-0">{formatCurrency(exp.amount)}</p>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${style.badge}`}>{exp.category}</span>
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onEdit(exp)} title="Edit expense" aria-label="Edit expense"
                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 flex items-center justify-center transition">
                        <Pencil size={14} className="text-blue-600" />
                    </button>
                    <button type="button" onClick={() => onDelete(exp)} title="Delete expense" aria-label="Delete expense"
                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 active:bg-red-100 flex items-center justify-center transition">
                        <Trash2 size={14} className="text-red-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPENSES PAGE
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50];

const Expenses = () => {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState("date-desc");
    const [showFilters, setShowFilters] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const [expRes, sumRes] = await Promise.allSettled([
                axiosInstance.get(API_PATHS.EXPENSES.GET_ALL),
                axiosInstance.get(API_PATHS.EXPENSES.SUMMARY),
            ]);
            if (expRes.status === "fulfilled") {
                const raw = expRes.value.data?.expenses || expRes.value.data || [];
                setExpenses(Array.isArray(raw) ? raw : []);
            }
            if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
        } catch (e) {
            console.log(e);
            showToast("Couldn't load expenses. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── FILTER + SORT ──────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        let list = expenses.filter(exp => {
            if (categoryFilter !== "All" && exp.category !== categoryFilter) return false;
            if (paymentFilter !== "All" && exp.paymentMode !== paymentFilter) return false;
            if (dateFrom && new Date(exp.date) < new Date(dateFrom)) return false;
            if (dateTo && new Date(exp.date) > new Date(new Date(dateTo).setHours(23, 59, 59, 999))) return false;
            if (q && !(exp.title || "").toLowerCase().includes(q) && !(exp.vendor || "").toLowerCase().includes(q) && !(exp.notes || "").toLowerCase().includes(q)) return false;
            return true;
        });
        const [field, dir] = sortBy.split("-");
        list = list.slice().sort((a, b) => {
            let cmp = 0;
            if (field === "date") cmp = new Date(a.date) - new Date(b.date);
            else if (field === "amount") cmp = a.amount - b.amount;
            return dir === "asc" ? cmp : -cmp;
        });
        return list;
    }, [expenses, searchQuery, categoryFilter, paymentFilter, dateFrom, dateTo, sortBy]);

    const filteredTotal = useMemo(() => filtered.reduce((s, e) => s + (e.amount || 0), 0), [filtered]);

    // reset to page 1 whenever filters change
    useEffect(() => { setPage(1); }, [searchQuery, categoryFilter, paymentFilter, dateFrom, dateTo, sortBy, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    // ── DELETE ─────────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await axiosInstance.delete(API_PATHS.EXPENSES.DELETE(deleteTarget._id));
            showToast("Expense deleted");
            setDeleteTarget(null);
            fetchData({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't delete expense.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery(""); setCategoryFilter("All"); setPaymentFilter("All");
        setDateFrom(""); setDateTo(""); setSortBy("date-desc");
    };
    const hasActiveFilters = searchQuery || categoryFilter !== "All" || paymentFilter !== "All" || dateFrom || dateTo;

    // ── CSV EXPORT ─────────────────────────────────────────────────────────
    const exportCSV = () => {
        const header = ["Date", "Title", "Category", "Payment Mode", "Vendor", "Amount", "Notes"];
        const rows = filtered.map(e => [
            fmtDate(e.date), e.title, e.category, e.paymentMode, e.vendor || "", e.amount, (e.notes || "").replace(/\n/g, " "),
        ]);
        const csv = [header, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses-${toInputDateSafe(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const toInputDateSafe = (d) => { const p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };

    // ── MONTH CHANGE % ─────────────────────────────────────────────────────
    const monthChange = useMemo(() => {
        if (!summary || !summary.lastMonth) return null;
        return Math.round(((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100);
    }, [summary]);

    const hasData = expenses.length > 0;

    return (
        <DashboardLayout activeMenu="Expenses">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expenses</h1>
                        <p className="text-sm text-gray-500 mt-1">Track, filter and manage every business expense</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchData({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 w-11 sm:w-auto sm:px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button type="button" onClick={() => navigate("/admin/add-expense")}
                            className="cursor-pointer h-11 px-4 sm:px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-blue-200">
                            <Plus size={17} />
                            Add Expense
                        </button>
                    </div>
                </div>

                {/* STAT CARDS */}
                {loading ? <StatSkeleton /> : summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Wallet size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Total Spent</p>
                                <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(summary.total)}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Receipt size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">This Month</p>
                                <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(summary.thisMonth)}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${monthChange > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                {monthChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">vs Last Month</p>
                                <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{monthChange === null ? "—" : `${monthChange > 0 ? "+" : ""}${monthChange}%`}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><ArrowUpDown size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Avg / Expense</p>
                                <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(summary.avg)}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><Receipt size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Transactions</p>
                                <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{summary.count}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* FILTERS */}
                {!loading && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                            <div className="relative flex-1 min-w-[180px]">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search title, vendor or notes..."
                                    className="w-full h-10 pl-10 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            <button type="button" onClick={() => setShowFilters(v => !v)}
                                className={`cursor-pointer h-10 px-4 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 border
                                    ${showFilters || hasActiveFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                                <Filter size={14} /> Filters
                            </button>

                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer">
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Amount: High to Low</option>
                                <option value="amount-asc">Amount: Low to High</option>
                            </select>

                            <button type="button" onClick={exportCSV} disabled={filtered.length === 0}
                                className="cursor-pointer h-10 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600 flex items-center gap-2 text-sm font-medium transition-all">
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        {showFilters && (
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-3 border-t border-gray-100">
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                    className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer flex-1 min-w-[160px]">
                                    <option value="All">All Categories</option>
                                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                                    className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer flex-1 min-w-[160px]">
                                    <option value="All">All Payment Modes</option>
                                    {PAYMENT_MODES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                    className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer flex-1 min-w-[140px]" />
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                    className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer flex-1 min-w-[140px]" />
                                {hasActiveFilters && (
                                    <button type="button" onClick={clearFilters}
                                        className="cursor-pointer h-10 px-4 rounded-2xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-medium transition-all flex items-center gap-1.5">
                                        <X size={14} /> Clear
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* RESULTS SUMMARY */}
                {!loading && (
                    <div className="flex items-center justify-between px-1">
                        <p className="text-sm text-gray-500">
                            {filtered.length} expense{filtered.length !== 1 ? "s" : ""} · <span className="font-semibold text-gray-800">{formatCurrency(filteredTotal)}</span> total
                        </p>
                    </div>
                )}

                {/* LIST */}
                <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6">
                    {loading ? <TableSkeleton /> : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <Receipt size={28} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{hasData ? "No matching expenses" : "No expenses yet"}</h3>
                            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                {hasData ? "Try adjusting your filters or search." : "Add your first expense to start tracking spend."}
                            </p>
                            {!hasData && (
                                <button type="button" onClick={() => navigate("/admin/add-expense")}
                                    className="cursor-pointer mt-5 h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2">
                                    <Plus size={16} /> Add Expense
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {["Date", "Expense", "Category", "Payment", "", ""].map((h, i) => (
                                                <th key={i} className={`py-2 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {paginated.map(exp => (
                                            <ExpenseTableRow key={exp._id} exp={exp}
                                                onEdit={(e) => navigate(`/admin/add-expense?id=${e._id}`)}
                                                onDelete={setDeleteTarget} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden space-y-3">
                                {paginated.map(exp => (
                                    <ExpenseCard key={exp._id} exp={exp}
                                        onEdit={(e) => navigate(`/admin/add-expense?id=${e._id}`)}
                                        onDelete={setDeleteTarget} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-5 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>Rows per page</span>
                                    <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
                                        className="h-9 px-2.5 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                                        {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                                    <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition">
                                        <ChevronLeft size={15} className="text-gray-600" />
                                    </button>
                                    <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition">
                                        <ChevronRight size={15} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
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

export default Expenses;