import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { EXPENSE_CATEGORIES, CATEGORY_STYLE, formatCurrency, MONTH_NAMES } from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, ChevronLeft, ChevronRight, X, Pencil, Trash2,
    Wallet, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Target, TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS / TOAST
// ─────────────────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-3xl" />)}
    </div>
);

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

    const inputCls = (field) => `w-full h-11 px-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 transition
        ${errors[field] ? "border-red-300 focus:ring-red-400 bg-red-50/40" : "border-gray-200 focus:ring-blue-500"}`;

    // when editing, lock the category; when creating, hide categories that already have a budget this month
    const availableCategories = initialData ? [initialData.category] : EXPENSE_CATEGORIES.filter(c => !existingCategories.includes(c));

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-[26px] shadow-2xl max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                            {initialData ? <Pencil size={18} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">{initialData ? "Edit Budget" : "Set Budget"}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{MONTH_NAMES[month - 1]} {year}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-500">*</span></label>
                        <select value={form.category} onChange={set("category")} disabled={!!initialData}
                            className={`${inputCls("category")} cursor-pointer bg-white disabled:bg-gray-50 disabled:text-gray-500`}>
                            <option value="">Select category</option>
                            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>}
                        {!initialData && availableCategories.length === 0 && (
                            <p className="text-[11px] text-amber-600 mt-1">Every category already has a budget this month — edit one instead.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget Amount (₹) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Wallet size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00"
                                className={`${inputCls("amount")} pl-10`} />
                        </div>
                        {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                        <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="e.g. Includes contractor payouts"
                            className={`${inputCls("notes")} !h-auto py-3 resize-none`} />
                    </div>
                </form>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting || (!initialData && availableCategories.length === 0)}
                        className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2">
                        {submitting && <Loader2 size={15} className="animate-spin" />}
                        {initialData ? "Save Changes" : "Set Budget"}
                    </button>
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
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-[26px] shadow-2xl p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center">Delete this budget?</h3>
                <p className="text-sm text-gray-500 text-center mt-1.5">
                    The budget for "{budget.category}" this month will be removed.
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
// BUDGET CARD
// ─────────────────────────────────────────────────────────────────────────────

const BudgetCard = ({ b, onEdit, onDelete }) => {
    const style = CATEGORY_STYLE[b.category] || CATEGORY_STYLE.Miscellaneous;
    const Icon = style.icon;
    const pct = Math.min(b.pct, 100);
    const barColor = b.status === "Over Budget" ? "bg-red-500" : b.status === "Near Limit" ? "bg-amber-500" : "bg-green-500";
    const statusBadge = b.status === "Over Budget" ? "bg-red-50 text-red-700 border-red-200"
        : b.status === "Near Limit" ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-green-50 text-green-700 border-green-200";

    return (
        <div className="rounded-3xl border border-gray-200 p-5 bg-white flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                        <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{b.category}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge}`}>{b.status}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => onEdit(b)} title="Edit budget" aria-label="Edit budget"
                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 flex items-center justify-center transition">
                        <Pencil size={14} className="text-blue-600" />
                    </button>
                    <button type="button" onClick={() => onDelete(b)} title="Delete budget" aria-label="Delete budget"
                        className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 active:bg-red-100 flex items-center justify-center transition">
                        <Trash2 size={14} className="text-red-600" />
                    </button>
                </div>
            </div>

            <div>
                <div className="flex items-end justify-between mb-1.5">
                    <p className="text-xl font-extrabold text-gray-900">{formatCurrency(b.spent)}</p>
                    <p className="text-xs text-gray-400">of {formatCurrency(b.amount)}</p>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] text-gray-400">{b.pct}% used</p>
                    <p className={`text-[11px] font-medium ${b.remaining < 0 ? "text-red-600" : "text-gray-500"}`}>
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

    return (
        <DashboardLayout activeMenu="Budgets">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budgets</h1>
                        <p className="text-sm text-gray-500 mt-1">Set monthly limits per category and track them live</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchBudgets({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 w-11 sm:w-auto sm:px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button type="button" onClick={openCreate}
                            className="cursor-pointer h-11 px-4 sm:px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-blue-200">
                            <Plus size={17} />
                            Set Budget
                        </button>
                    </div>
                </div>

                {/* MONTH NAV */}
                <div className="bg-white border border-gray-200 rounded-3xl p-4 flex items-center justify-between">
                    <button type="button" onClick={prevMonth}
                        className="cursor-pointer h-10 w-10 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center">
                        <ChevronLeft size={17} className="text-gray-600" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-gray-900">{MONTH_NAMES[month - 1]} {year}</h2>
                        <button type="button" onClick={goThisMonth}
                            className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">This Month</button>
                    </div>
                    <button type="button" onClick={nextMonth}
                        className="cursor-pointer h-10 w-10 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center">
                        <ChevronRight size={17} className="text-gray-600" />
                    </button>
                </div>

                {loading ? <CardSkeleton /> : (
                    <>
                        {/* OVERALL SUMMARY */}
                        {hasData && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/70 font-medium">Overall Budget Health</p>
                                            <h2 className="text-xl font-bold mt-0.5">{totals.pct}% Used</h2>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-5">
                                        {[
                                            { label: "Budgeted", val: formatCurrency(totals.budgeted) },
                                            { label: "Spent", val: formatCurrency(totals.spent) },
                                            { label: "Remaining", val: formatCurrency(totals.remaining) },
                                        ].map(({ label, val }) => (
                                            <div key={label} className="text-center">
                                                <p className="text-lg font-extrabold">{val}</p>
                                                <p className="text-xs text-white/70">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="h-2.5 rounded-full bg-white/20">
                                        <div className="h-2.5 rounded-full bg-white transition-all duration-700" style={{ width: `${Math.min(totals.pct, 100)}%` }} />
                                    </div>
                                </div>
                                {totals.overBudgetCount > 0 && (
                                    <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-2xl px-3 py-2">
                                        <AlertTriangle size={15} />
                                        <p className="text-xs font-medium">{totals.overBudgetCount} categor{totals.overBudgetCount !== 1 ? "ies are" : "y is"} over budget this month</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BUDGET CARDS */}
                        {!hasData ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                                <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <Target size={28} className="text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">No budgets set for {MONTH_NAMES[month - 1]} {year}</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                    Set a spending limit per category to start tracking progress automatically.
                                </p>
                                <button type="button" onClick={openCreate}
                                    className="cursor-pointer mt-5 h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2">
                                    <Plus size={16} /> Set Budget
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <style>{`
                @keyframes modalPop { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
                @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </DashboardLayout>
    );
};

export default Budgets;