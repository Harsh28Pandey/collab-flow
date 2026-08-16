// src/pages/Admin/Budgets.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { EXPENSE_CATEGORIES, CATEGORY_STYLE, formatCurrency, MONTH_NAMES } from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, ChevronLeft, ChevronRight, X, Pencil, Trash2,
    Wallet, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Target, TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => <SkeletonBlock key={i} className="h-40 rounded-[2rem]" />)}
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
// BUDGET FORM MODAL (create + edit)
// ─────────────────────────────────────────────────────────────────────────────

const BudgetFormModal = ({ open, initialData, month, year, existingCategories, onClose, onSubmit, submitting }) => {
    const [form, setForm] = useState({ category: "", amount: "", notes: "" });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        if (initialData) {
            setForm({ category: initialData.category, amount: String(initialData.amount), notes: initialData.notes || "" });
        } else {
            setForm({ category: "", amount: "", notes: "" });
        }
        setErrors({});
    }, [open, initialData]);

    if (!open) return null;

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.category) errs.category = "Select a category";
        if (!form.amount || Number(form.amount) <= 0) errs.amount = "Enter a valid budget amount";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({ ...form, amount: Number(form.amount), month, year });
    };

    const inputCls = (field) => `w-full h-12 px-4 rounded-2xl border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 transition [color-scheme:dark]
        ${errors[field] ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white" : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600 shadow-inner"}`;

    // when editing, lock the category; when creating, hide categories that already have a budget this month
    const availableCategories = initialData ? [initialData.category] : EXPENSE_CATEGORIES.filter(c => !existingCategories.includes(c));

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 py-8 animate-fadeIn overflow-hidden" onClick={onClose}>
            <div className="w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease] m-auto" onClick={e => e.stopPropagation()}>

                {/* Top Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>

                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            {initialData ? <Pencil size={18} className="text-cyan-400" /> : <Plus size={20} className="text-cyan-400" />}
                        </div>
                        <div>
                            <h2 className="text-base font-mono font-black text-white tracking-wide">{initialData ? "Edit Budget" : "Set Budget"}</h2>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{MONTH_NAMES[month - 1]} {year}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition text-zinc-400 hover:text-white shadow-inner">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 custom-scrollbar">
                    <div>
                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Category <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <select value={form.category} onChange={set("category")} disabled={!!initialData}
                                className={`${inputCls("category")} appearance-none pl-4 pr-11 cursor-pointer bg-zinc-950/80 disabled:opacity-60`}>
                                <option value="" className="bg-zinc-900 text-zinc-500">Select category</option>
                                {availableCategories.map(c => <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                        {errors.category && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.category}</p>}
                        {!initialData && availableCategories.length === 0 && (
                            <p className="text-[11px] font-mono text-amber-400 mt-1">Every category already has a budget this month — edit one instead.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Budget Amount (₹) <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00"
                                className={`${inputCls("amount")} pl-11`} />
                        </div>
                        {errors.amount && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Notes <span className="text-zinc-500 font-normal">(optional)</span></label>
                        <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="e.g. Includes contractor payouts"
                            className={`${inputCls("notes")} !h-auto py-3 resize-none`} />
                    </div>
                </form>

                <div className="px-5 py-4 border-t border-white/5 flex items-center justify-end gap-3 shrink-0 bg-zinc-950/40">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                        <button type="button" onClick={handleSubmit} disabled={submitting || (!initialData && availableCategories.length === 0)}
                            className="relative cursor-pointer h-11 px-6 rounded-2xl bg-zinc-950 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center gap-2">
                            {submitting && <Loader2 size={15} className="animate-spin text-cyan-400" />}
                            <span>{initialData ? "Save Changes" : "Set Budget"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmDeleteModal = ({ budget, onClose, onConfirm, deleting }) => {
    if (!budget) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 animate-[modalPop_.2s_ease] relative overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Top Ambient Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Trash2 size={20} className="text-rose-400" />
                </div>
                <h3 className="text-base font-mono font-black text-white text-center tracking-wide">Delete this budget?</h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 text-center mt-1.5 leading-relaxed">
                    The budget for "{budget.category}" this month will be removed.
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
// BUDGET CARD
// ─────────────────────────────────────────────────────────────────────────────

const BudgetCard = ({ b, onEdit, onDelete }) => {
    const style = CATEGORY_STYLE[b.category] || CATEGORY_STYLE.Miscellaneous;
    const Icon = style.icon;
    const pct = Math.min(b.pct, 100);
    const barColor = b.status === "Over Budget" ? "bg-rose-500" : b.status === "Near Limit" ? "bg-amber-500" : "bg-emerald-500";
    const statusBadge = b.status === "Over Budget" ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
        : b.status === "Near Limit" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    return (
        <div className="rounded-[2rem] border border-white/10 p-5 bg-zinc-950/60 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-5 hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                        <Icon size={18} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-mono font-bold text-white truncate tracking-wide">{b.category}</p>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner mt-1 inline-block ${statusBadge}`}>{b.status}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => onEdit(b)} title="Edit budget" aria-label="Edit budget"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center transition shadow-inner active:scale-95">
                        <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => onDelete(b)} title="Delete budget" aria-label="Delete budget"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 flex items-center justify-center transition shadow-inner active:scale-95">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            <div>
                <div className="flex items-end justify-between mb-2">
                    <p className="text-xl font-mono font-black text-white">{formatCurrency(b.spent)}</p>
                    <p className="text-xs font-mono text-zinc-500">of {formatCurrency(b.amount)}</p>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-900 border border-white/5 overflow-hidden shadow-inner">
                    <div className={`h-2.5 rounded-full ${barColor} transition-all duration-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] font-mono text-zinc-400">{b.pct}% used</p>
                    <p className={`text-[11px] font-mono font-bold ${b.remaining < 0 ? "text-rose-400" : "text-zinc-400"}`}>
                        {b.remaining < 0 ? `${formatCurrency(Math.abs(b.remaining))} over` : `${formatCurrency(b.remaining)} left`}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN BUDGETS PAGE
// ─────────────────────────────────────────────────────────────────────────────

const Budgets = () => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchBudgets = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await axiosInstance.get(`${API_PATHS.BUDGETS.GET_ALL}?month=${month}&year=${year}`);
            const raw = res.data?.budgets || [];
            setBudgets(Array.isArray(raw) ? raw : []);
        } catch (e) {
            console.log(e);
            showToast("Couldn't load budgets. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [month, year]);

    useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
    const goThisMonth = () => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); };

    const openCreate = () => { setEditingBudget(null); setFormOpen(true); };
    const openEdit = (b) => { setEditingBudget(b); setFormOpen(true); };

    const handleFormSubmit = async (form) => {
        try {
            setSubmitting(true);
            await axiosInstance.post(API_PATHS.BUDGETS.UPSERT, form);
            showToast(editingBudget ? "Budget updated successfully" : "Budget set successfully");
            setFormOpen(false);
            setEditingBudget(null);
            fetchBudgets({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Something went wrong. Try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await axiosInstance.delete(API_PATHS.BUDGETS.DELETE(deleteTarget._id));
            showToast("Budget deleted");
            setDeleteTarget(null);
            fetchBudgets({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't delete budget.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const totals = useMemo(() => {
        const budgeted = budgets.reduce((s, b) => s + b.amount, 0);
        const spent = budgets.reduce((s, b) => s + b.spent, 0);
        const remaining = budgeted - spent;
        const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
        const overBudgetCount = budgets.filter(b => b.status === "Over Budget").length;
        return { budgeted, spent, remaining, pct, overBudgetCount };
    }, [budgets]);

    const existingCategories = useMemo(() => budgets.map(b => b.category), [budgets]);
    const hasData = budgets.length > 0;

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
        <DashboardLayout activeMenu="Budgets">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Budgets</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Set monthly limits per category and track them live</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchBudgets({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={openCreate}
                                className="relative cursor-pointer h-11 px-5 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95">
                                <Plus size={16} className="text-cyan-400 stroke-[3]" />
                                Set Budget
                            </button>
                        </div>
                    </div>
                </div>

                {/* MONTH NAV */}
                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <button type="button" onClick={prevMonth}
                        className="cursor-pointer h-10 w-10 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white transition flex items-center justify-center shadow-inner">
                        <ChevronLeft size={18} className="stroke-[2.5]" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-base sm:text-lg font-mono font-bold text-white">{MONTH_NAMES[month - 1]} {year}</h2>
                        <button type="button" onClick={goThisMonth}
                            className="cursor-pointer text-xs font-mono text-cyan-400 hover:underline mt-0.5 block">This Month</button>
                    </div>
                    <button type="button" onClick={nextMonth}
                        className="cursor-pointer h-10 w-10 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white transition flex items-center justify-center shadow-inner">
                        <ChevronRight size={18} className="stroke-[2.5]" />
                    </button>
                </div>

                {loading ? <CardSkeleton /> : (
                    <>
                        {/* OVERALL SUMMARY */}
                        {hasData && (
                            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 text-white shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-3.5">
                                        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                                            <Target size={22} className="stroke-[2.5]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Overall Budget Health</p>
                                            <h2 className="text-xl sm:text-2xl font-mono font-black mt-0.5 text-white">{totals.pct}% Used</h2>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-6 bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-3 shadow-inner">
                                        {[
                                            { label: "Budgeted", val: formatCurrency(totals.budgeted) },
                                            { label: "Spent", val: formatCurrency(totals.spent) },
                                            { label: "Remaining", val: formatCurrency(totals.remaining) },
                                        ].map(({ label, val }) => (
                                            <div key={label} className="text-left sm:text-center">
                                                <p className="text-base sm:text-lg font-mono font-black text-white">{val}</p>
                                                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-5 relative z-10">
                                    <div className="h-2.5 rounded-full bg-zinc-900 border border-white/5 overflow-hidden shadow-inner">
                                        <div className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${Math.min(totals.pct, 100)}%` }} />
                                    </div>
                                </div>
                                {totals.overBudgetCount > 0 && (
                                    <div className="flex items-center gap-2 mt-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-2.5 shadow-inner relative z-10">
                                        <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                                        <p className="text-xs font-mono font-bold text-rose-300">{totals.overBudgetCount} categor{totals.overBudgetCount !== 1 ? "ies are" : "y is"} over budget this month</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BUDGET CARDS */}
                        {!hasData ? (
                            <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                                    <Target size={36} className="text-cyan-400" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">No budgets set for {MONTH_NAMES[month - 1]} {year}</h3>
                                <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                                    Set a spending limit per category to start tracking progress automatically.
                                </p>
                                <div className="relative group cursor-pointer mt-6">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                    <button type="button" onClick={openCreate}
                                        className="relative cursor-pointer h-12 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-lg">
                                        <Plus size={16} className="text-cyan-400 stroke-[3]" /> Set Budget
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {budgets.map(b => <BudgetCard key={b._id} b={b} onEdit={openEdit} onDelete={setDeleteTarget} />)}
                            </div>
                        )}
                    </>
                )}
            </div>

            <BudgetFormModal
                open={formOpen}
                initialData={editingBudget}
                month={month}
                year={year}
                existingCategories={existingCategories}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditingBudget(null); }}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDeleteModal budget={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
            <Toast toast={toast} onClose={() => setToast(null)} />

        </DashboardLayout>
    );
};

export default Budgets;