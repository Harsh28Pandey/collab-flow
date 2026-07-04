import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODES, PAYMENT_MODE_ICON,
    RECURRING_FREQUENCIES, formatCurrency, fmtDate, toInputDate,
} from "../../utils/expenseConstants.js";
import {
    Wallet, Calendar, CreditCard, StickyNote, Store, Repeat, Save,
    RotateCcw, Loader2, CheckCircle2, AlertCircle, X, ArrowLeft, Receipt,
} from "lucide-react";

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
            <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const SidebarSkeleton = () => (
    <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="h-9 w-9 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

const EMPTY_FORM = {
    title: "", amount: "", category: "", date: toInputDate(new Date()),
    paymentMode: "", vendor: "", notes: "", isRecurring: false, recurringFrequency: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const AddExpense = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("id");
    const isEditMode = !!editId;

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    const [recent, setRecent] = useState([]);
    const [recentLoading, setRecentLoading] = useState(true);

    // ── Load expense for edit mode ────────────────────────────────────────
    useEffect(() => {
        if (!isEditMode) return;
        (async () => {
            try {
                setLoadingEdit(true);
                const res = await axiosInstance.get(API_PATHS.EXPENSES.GET_BY_ID(editId));
                const e = res.data?.expense || res.data;
                setForm({
                    title: e.title || "",
                    amount: e.amount ?? "",
                    category: e.category || "",
                    date: e.date ? toInputDate(e.date) : toInputDate(new Date()),
                    paymentMode: e.paymentMode || "",
                    vendor: e.vendor || "",
                    notes: e.notes || "",
                    isRecurring: !!e.isRecurring,
                    recurringFrequency: e.recurringFrequency || "",
                });
            } catch (err) {
                console.log(err);
                showToast("Couldn't load this expense.", "error");
            } finally {
                setLoadingEdit(false);
            }
        })();
    }, [isEditMode, editId]);

    // ── Recent expenses (sidebar) ─────────────────────────────────────────
    const fetchRecent = useCallback(async () => {
        try {
            setRecentLoading(true);
            const res = await axiosInstance.get(API_PATHS.EXPENSES.GET_ALL);
            const raw = res.data?.expenses || res.data || [];
            setRecent(Array.isArray(raw) ? raw.slice(0, 6) : []);
        } catch (e) {
            console.log(e);
        } finally {
            setRecentLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecent(); }, [fetchRecent]);

    // ── Form handlers ──────────────────────────────────────────────────────
    const set = (field) => (e) => {
        const val = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
        setForm(f => ({ ...f, [field]: val }));
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Expense title is required";
        if (!form.amount || Number(form.amount) <= 0) errs.amount = "Enter a valid amount";
        if (!form.category) errs.category = "Select a category";
        if (!form.date) errs.date = "Date is required";
        if (!form.paymentMode) errs.paymentMode = "Select a payment mode";
        if (form.isRecurring && !form.recurringFrequency) errs.recurringFrequency = "Select a frequency";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const resetForm = () => { setForm(EMPTY_FORM); setErrors({}); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSubmitting(true);
            const payload = {
                ...form,
                amount: Number(form.amount),
                recurringFrequency: form.isRecurring ? form.recurringFrequency : null,
            };
            if (isEditMode) {
                await axiosInstance.put(API_PATHS.EXPENSES.UPDATE(editId), payload);
                showToast("Expense updated successfully");
                setTimeout(() => navigate("/admin/expenses"), 700);
            } else {
                await axiosInstance.post(API_PATHS.EXPENSES.CREATE, payload);
                showToast("Expense added successfully");
                resetForm();
                fetchRecent();
            }
        } catch (err) {
            console.log(err);
            showToast(err?.response?.data?.message || "Something went wrong. Try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = (field) => `w-full h-11 px-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 transition
        ${errors[field] ? "border-red-300 focus:ring-red-400 bg-red-50/40" : "border-gray-200 focus:ring-blue-500"}`;

    const selectedCategoryStyle = form.category ? CATEGORY_STYLE[form.category] : null;
    const totalRecent = useMemo(() => recent.reduce((s, r) => s + (r.amount || 0), 0), [recent]);

    return (
        <DashboardLayout activeMenu="Add Expense">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {isEditMode && (
                            <button type="button" onClick={() => navigate("/admin/expenses")}
                                className="cursor-pointer h-11 w-11 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition shrink-0">
                                <ArrowLeft size={18} className="text-gray-600" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{isEditMode ? "Edit Expense" : "Add Expense"}</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {isEditMode ? "Update the details of this expense" : "Log a new business expense"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 items-start">

                    {/* FORM */}
                    <div className="flex-1 w-full bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 min-w-0">
                        {loadingEdit ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(6)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded-2xl" />)}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expense Title <span className="text-red-500">*</span></label>
                                    <input type="text" value={form.title} onChange={set("title")} placeholder="e.g. AWS hosting bill"
                                        className={inputCls("title")} />
                                    {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                {/* Amount + Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Wallet size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00"
                                                className={`${inputCls("amount")} pl-10`} />
                                        </div>
                                        {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input type="date" value={form.date} onChange={set("date")}
                                                className={`${inputCls("date")} pl-10 cursor-pointer`} />
                                        </div>
                                        {errors.date && <p className="text-[11px] text-red-500 mt-1">{errors.date}</p>}
                                    </div>
                                </div>

                                {/* Category quick-picks */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">Category <span className="text-red-500">*</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXPENSE_CATEGORIES.map(cat => {
                                            const style = CATEGORY_STYLE[cat];
                                            const Icon = style.icon;
                                            const active = form.category === cat;
                                            return (
                                                <button key={cat} type="button" onClick={() => set("category")(cat)}
                                                    className={`cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-2xl border transition-all
                                                        ${active ? `${style.solid} text-white border-transparent` : `bg-white ${style.badge} hover:brightness-95`}`}>
                                                    <Icon size={13} />
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.category && <p className="text-[11px] text-red-500 mt-1.5">{errors.category}</p>}
                                </div>

                                {/* Payment mode */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Mode <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <CreditCard size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <select value={form.paymentMode} onChange={set("paymentMode")}
                                            className={`${inputCls("paymentMode")} pl-10 cursor-pointer bg-white appearance-none`}>
                                            <option value="">Select payment mode</option>
                                            {PAYMENT_MODES.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                                        </select>
                                    </div>
                                    {errors.paymentMode && <p className="text-[11px] text-red-500 mt-1">{errors.paymentMode}</p>}
                                </div>

                                {/* Vendor */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Paid To / Vendor <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <Store size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={form.vendor} onChange={set("vendor")} placeholder="e.g. Amazon Web Services"
                                            className={`${inputCls("vendor")} pl-10`} />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <StickyNote size={15} className="absolute left-4 top-3.5 text-gray-400" />
                                        <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Any extra detail about this expense..."
                                            className={`${inputCls("notes")} !h-auto py-3 pl-10 resize-none`} />
                                    </div>
                                </div>

                                {/* Recurring */}
                                <div className="rounded-2xl border border-gray-200 p-4">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" checked={form.isRecurring} onChange={set("isRecurring")}
                                            className="cursor-pointer h-5 w-5 rounded-md accent-blue-600" />
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Repeat size={15} className="text-indigo-600" /> This is a recurring expense
                                        </span>
                                    </label>
                                    {form.isRecurring && (
                                        <div className="mt-3 pl-8">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Frequency <span className="text-red-500">*</span></label>
                                            <select value={form.recurringFrequency} onChange={set("recurringFrequency")}
                                                className={`${inputCls("recurringFrequency")} cursor-pointer bg-white max-w-[220px]`}>
                                                <option value="">Select frequency</option>
                                                {RECURRING_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            {errors.recurringFrequency && <p className="text-[11px] text-red-500 mt-1">{errors.recurringFrequency}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Live preview */}
                                {form.category && form.amount > 0 && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedCategoryStyle.badge} border`}>
                                            {React.createElement(selectedCategoryStyle.icon, { size: 18 })}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{form.title || "Untitled expense"}</p>
                                            <p className="text-xs text-blue-700">{form.category} · {formatCurrency(Number(form.amount) || 0)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                    <button type="submit" disabled={submitting}
                                        className="cursor-pointer h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isEditMode ? "Save Changes" : "Save Expense"}
                                    </button>
                                    <button type="button" onClick={isEditMode ? () => navigate("/admin/expenses") : resetForm} disabled={submitting}
                                        className="cursor-pointer h-12 px-6 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                        {isEditMode ? <X size={16} /> : <RotateCcw size={16} />}
                                        {isEditMode ? "Cancel" : "Reset"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* SIDEBAR — Recent Expenses */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-5 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-3xl p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="h-9 w-9 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <Receipt size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Recently Added</h3>
                                    <p className="text-xs text-gray-400">{recentLoading ? "Loading…" : `${formatCurrency(totalRecent)} across last ${recent.length}`}</p>
                                </div>
                            </div>
                            {recentLoading ? <SidebarSkeleton /> : recent.length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-2xl py-8 text-center">
                                    <Receipt size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm font-medium text-gray-600">No expenses yet</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Your first one will show up here</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                                    {recent.map(exp => {
                                        const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
                                        const Icon = style.icon;
                                        return (
                                            <div key={exp._id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/60">
                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                                                    <Icon size={13} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{fmtDate(exp.date)} · {exp.paymentMode}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(exp.amount)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Toast toast={toast} onClose={() => setToast(null)} />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
            `}</style>
        </DashboardLayout>
    );
};

export default AddExpense;