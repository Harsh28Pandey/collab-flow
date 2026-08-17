import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext.jsx";
import {
    EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODES,
    formatCurrency, fmtDate,
} from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, Search, Download, Pencil, Trash2, X,
    ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown,
    Receipt, ArrowUpDown, CheckCircle2, AlertCircle, Loader2, Filter,
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
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse">
        <SkeletonBlock className="h-[76px] rounded-2xl flex" />
        <SkeletonBlock className="h-[76px] rounded-2xl hidden sm:flex" />
        <SkeletonBlock className="h-[76px] rounded-2xl hidden sm:flex" />
        <SkeletonBlock className="h-[76px] rounded-2xl flex" />
        <SkeletonBlock className="h-[76px] rounded-2xl flex" />
    </div>
);

const TableSkeleton = () => (
    <div className="animate-pulse space-y-3 mt-4">
        {[...Array(8)].map((_, i) => <SkeletonBlock key={i} className="h-16 rounded-2xl" />)}
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
                ${ok ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
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
            <div className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                
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
// EXPENSE ROW (desktop table)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseTableRow = ({ exp, onEdit, onDelete }) => {
    const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
    const Icon = style.icon;
    return (
        <tr className="hover:bg-zinc-900/40 transition-all duration-200 border-b border-white/5 last:border-0">
            <td className="py-3 px-4 text-xs font-mono text-zinc-400 whitespace-nowrap">{fmtDate(exp.date)}</td>
            <td className="py-3 px-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                        <Icon size={14} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-mono font-bold text-white truncate max-w-[220px] tracking-wide">{exp.title}</p>
                        {exp.vendor && <p className="text-[11px] font-mono text-zinc-500 truncate max-w-[220px] mt-0.5">{exp.vendor}</p>}
                    </div>
                </div>
            </td>
            <td className="py-3 px-4">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner whitespace-nowrap ${style.badge}`}>{exp.category}</span>
            </td>
            <td className="py-3 px-4 text-xs font-mono text-zinc-400 whitespace-nowrap">{exp.paymentMode}</td>
            <td className="py-3 px-4 text-sm font-mono font-black text-white whitespace-nowrap text-right">{formatCurrency(exp.amount)}</td>
            <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1.5">
                    <button type="button" onClick={() => onEdit(exp)} title="Edit expense" aria-label="Edit expense"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center transition shadow-inner active:scale-95">
                        <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => onDelete(exp)} title="Delete expense" aria-label="Delete expense"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 flex items-center justify-center transition shadow-inner active:scale-95">
                        <Trash2 size={13} />
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
        <div className="rounded-[2rem] border border-white/10 p-5 bg-zinc-950/60 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                        <Icon size={16} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-mono font-bold text-white truncate tracking-wide">{exp.title}</p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{fmtDate(exp.date)} · {exp.paymentMode}</p>
                    </div>
                </div>
                <p className="text-base font-mono font-black text-white shrink-0">{formatCurrency(exp.amount)}</p>
            </div>
            <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-white/5">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner ${style.badge}`}>{exp.category}</span>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(exp)} title="Edit expense" aria-label="Edit expense"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center transition shadow-inner active:scale-95">
                        <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => onDelete(exp)} title="Delete expense" aria-label="Delete expense"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 flex items-center justify-center transition shadow-inner active:scale-95">
                        <Trash2 size={13} />
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
    const { user } = useContext(UserContext); // ✅ Logged-in user context add kiya

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
            
            const params = { teamCode: user?.teamCode };

            // We only need expRes now since we calculate summary locally for accurate team filtering
            const expRes = await axiosInstance.get(API_PATHS.EXPENSES.GET_ALL, { params });
            
            if (expRes.data) {
                const raw = expRes.data?.expenses || expRes.data || [];
                
                // ✅ Frontend Filter: Sirf naye admin ya current team ka data show hoga
                const adminExpenses = raw.filter(exp => {
                    if (!user) return false;
                    return exp.teamCode === user.teamCode || 
                           exp.createdBy === user._id || 
                           exp.createdBy?._id === user._id ||
                           exp.user === user._id ||
                           exp.user?._id === user._id;
                });

                setExpenses(adminExpenses);

                // ✅ Local Stat Calculation: Backend summary skip karke yahan strict filter par calculation ho rahi hai
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                let total = 0;
                let thisMonthTotal = 0;
                let lastMonthTotal = 0;

                adminExpenses.forEach(exp => {
                    const amt = exp.amount || 0;
                    total += amt;
                    const d = new Date(exp.date);
                    
                    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                        thisMonthTotal += amt;
                    } else if (
                        (currentMonth === 0 && d.getMonth() === 11 && d.getFullYear() === currentYear - 1) || 
                        (currentMonth > 0 && d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear)
                    ) {
                        lastMonthTotal += amt;
                    }
                });

                setSummary({
                    total,
                    thisMonth: thisMonthTotal,
                    lastMonth: lastMonthTotal,
                    avg: adminExpenses.length ? total / adminExpenses.length : 0,
                    count: adminExpenses.length
                });
            }

        } catch (e) {
            console.log(e);
            showToast("Couldn't load expenses. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

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
        <DashboardLayout activeMenu="Expenses">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Expenses</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Track, filter and manage every business expense</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchData({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={() => navigate("/admin/add-expense")}
                                className="relative cursor-pointer h-11 px-5 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95">
                                <Plus size={16} className="text-cyan-400 stroke-[3]" />
                                Add Expense
                            </button>
                        </div>
                    </div>
                </div>

                {/* STAT CARDS */}
                {loading ? <StatSkeleton /> : summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-blue-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Wallet size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Total Spent</p>
                                <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(summary.total)}</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex bg-zinc-950/60 backdrop-blur-3xl border border-indigo-500/20 rounded-2xl px-4 py-3.5 items-center gap-3.5 shadow-inner relative overflow-hidden">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Receipt size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">This Month</p>
                                <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(summary.thisMonth)}</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-3.5 items-center gap-3.5 shadow-inner relative overflow-hidden">
                            <div className={`h-10 w-10 rounded-xl border border-white/5 flex items-center justify-center shrink-0 shadow-inner ${monthChange > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                {monthChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">vs Last Month</p>
                                <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{monthChange === null ? "—" : `${monthChange > 0 ? "+" : ""}${monthChange}%`}</p>
                            </div>
                        </div>
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-amber-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><ArrowUpDown size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Avg / Expense</p>
                                <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(summary.avg)}</p>
                            </div>
                        </div>
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-purple-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Receipt size={16} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Transactions</p>
                                <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{summary.count}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* FILTERS CONTAINER */}
                {!loading && (
                    <div className="space-y-4 py-2">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                            
                            {/* Search */}
                            <div className="relative flex-1 min-w-[180px]">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search title, vendor or notes..."
                                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner" />
                            </div>

                            {/* Filter Toggle */}
                            <button type="button" onClick={() => setShowFilters(v => !v)}
                                className={`cursor-pointer h-12 px-5 rounded-2xl text-xs sm:text-sm font-mono font-bold transition-all flex items-center justify-center gap-2 border shadow-inner shrink-0
                                    ${showFilters || hasActiveFilters ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-zinc-900/80 text-zinc-300 border-white/10 hover:bg-zinc-800 hover:text-white"}`}>
                                <Filter size={16} /> Filters
                            </button>

                            {/* Sort */}
                            <div className="relative w-full sm:w-auto shrink-0">
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    className="appearance-none w-full sm:w-auto h-12 pl-4 pr-11 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white cursor-pointer shadow-inner">
                                    <option value="date-desc" className="bg-zinc-900 text-white">Newest First</option>
                                    <option value="date-asc" className="bg-zinc-900 text-white">Oldest First</option>
                                    <option value="amount-desc" className="bg-zinc-900 text-white">Amount: High to Low</option>
                                    <option value="amount-asc" className="bg-zinc-900 text-white">Amount: Low to High</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>

                            {/* Export */}
                            <button type="button" onClick={exportCSV} disabled={filtered.length === 0}
                                className="cursor-pointer h-12 px-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-400 flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner shrink-0">
                                <Download size={16} className="stroke-[2.5]" /> <span className="hidden sm:inline">Export</span> CSV
                            </button>
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4 border-t border-white/5">
                                
                                <div className="relative flex-1 min-w-[160px]">
                                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                        className="appearance-none w-full h-11 pl-4 pr-11 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white cursor-pointer shadow-inner">
                                        <option value="All" className="bg-zinc-900 text-white">All Categories</option>
                                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
                                </div>

                                <div className="relative flex-1 min-w-[160px]">
                                    <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                                        className="appearance-none w-full h-11 pl-4 pr-11 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white cursor-pointer shadow-inner">
                                        <option value="All" className="bg-zinc-900 text-white">All Payment Modes</option>
                                        {PAYMENT_MODES.map(p => <option key={p} value={p} className="bg-zinc-900 text-white">{p}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
                                </div>

                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                    className="h-11 px-4 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white cursor-pointer flex-1 min-w-[140px] shadow-inner [color-scheme:dark]" />
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                    className="h-11 px-4 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white cursor-pointer flex-1 min-w-[140px] shadow-inner [color-scheme:dark]" />
                                
                                {hasActiveFilters && (
                                    <button type="button" onClick={clearFilters}
                                        className="cursor-pointer h-11 px-5 rounded-xl border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-xs sm:text-sm font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-inner shrink-0">
                                        <X size={14} className="stroke-[3]" /> Clear
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* RESULTS SUMMARY */}
                {!loading && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs sm:text-sm font-mono text-zinc-400">
                            Showing <span className="font-bold text-cyan-400">{filtered.length}</span> expense{filtered.length !== 1 ? "s" : ""} · <span className="font-bold text-white">{formatCurrency(filteredTotal)}</span> total
                        </p>
                    </div>
                )}

                {/* LIST CONTAINER */}
                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)] w-full">
                    {loading ? <TableSkeleton /> : filtered.length === 0 ? (
                        <div className="py-16 sm:py-24 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                                <Receipt size={36} className="text-cyan-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">{hasData ? "No matching expenses" : "No expenses yet"}</h3>
                            <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                                {hasData ? "Try adjusting your filters or search query." : "Add your first expense to start tracking spend."}
                            </p>
                            {!hasData && (
                                <div className="relative group cursor-pointer mt-6">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                    <button type="button" onClick={() => navigate("/admin/add-expense")}
                                        className="relative cursor-pointer h-12 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-lg">
                                        <Plus size={16} className="text-cyan-400 stroke-[3]" /> Add Expense
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {["Date", "Expense", "Category", "Payment", "", ""].map((h, i) => (
                                                <th key={i} className={`py-3 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {paginated.map(exp => (
                                            <ExpenseTableRow key={exp._id} exp={exp}
                                                onEdit={(e) => navigate(`/admin/add-expense?id=${e._id}`)}
                                                onDelete={setDeleteTarget} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden space-y-4">
                                {paginated.map(exp => (
                                    <ExpenseCard key={exp._id} exp={exp}
                                        onEdit={(e) => navigate(`/admin/add-expense?id=${e._id}`)}
                                        onDelete={setDeleteTarget} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Rows</span>
                                    <div className="relative">
                                        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
                                            className="appearance-none h-10 pl-3 pr-8 rounded-xl border border-white/10 bg-zinc-900/80 text-xs font-mono font-bold text-white cursor-pointer outline-none focus:border-cyan-400 shadow-inner">
                                            {PAGE_SIZES.map(s => <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>)}
                                        </select>
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-zinc-400">Page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{totalPages}</span></span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shadow-inner">
                                            <ChevronLeft size={16} className="stroke-[2.5]" />
                                        </button>
                                        <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shadow-inner">
                                            <ChevronRight size={16} className="stroke-[2.5]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmDeleteModal expense={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
            <Toast toast={toast} onClose={() => setToast(null)} />

        </DashboardLayout>
    );
};

export default Expenses;