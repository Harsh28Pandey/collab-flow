import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext.jsx"; // ✅ UserContext import kiya
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
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-sm font-mono font-bold backdrop-blur-xl
                ${ok ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                {ok ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
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
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-2xl">
                <div className="h-9 w-9 bg-zinc-900 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-zinc-900 rounded-full" />
                    <div className="h-2.5 w-1/2 bg-zinc-900/60 rounded-full" />
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
    const { user } = useContext(UserContext); // ✅ UserContext se Admin data lia

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
            const params = { teamCode: user?.teamCode };
            const res = await axiosInstance.get(API_PATHS.EXPENSES.GET_ALL, { params });
            const raw = res.data?.expenses || res.data || [];

            // ✅ EXACT FILTER: Sirf Current Admin/Team ka Data aayega Sidebar me bhi
            const adminExpenses = Array.isArray(raw) ? raw.filter(exp => {
                if (!user) return false;
                return exp.teamCode === user.teamCode ||
                    exp.createdBy === user._id ||
                    exp.createdBy?._id === user._id ||
                    exp.user === user._id ||
                    exp.user?._id === user._id;
            }) : [];

            setRecent(adminExpenses.slice(0, 6)); // Top 6 recent layenge filter karne ke baad
        } catch (e) {
            console.log(e);
        } finally {
            setRecentLoading(false);
        }
    }, [user]);

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

    const inputCls = (field) => `w-full h-12 px-4 rounded-2xl border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 transition [color-scheme:dark]
        ${errors[field] ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white" : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600 shadow-inner"}`;

    const selectedCategoryStyle = form.category ? CATEGORY_STYLE[form.category] : null;
    const totalRecent = useMemo(() => recent.reduce((s, r) => s + (r.amount || 0), 0), [recent]);

    // Style injections for scrollbars and animations
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn .2s ease; }
            .custom-scrollbar::-webkit-scrollbar { width:4px; height:4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
            .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <DashboardLayout activeMenu="Add Expense">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {isEditMode && (
                            <button type="button" onClick={() => navigate("/admin/expenses")}
                                className="cursor-pointer h-11 w-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center transition shrink-0 shadow-inner">
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{isEditMode ? "Edit Expense" : "Add Expense"}</h1>
                            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                {isEditMode ? "Update the details of this expense" : "Log a new business expense"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* FORM */}
                    <div className="flex-1 w-full bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 min-w-0 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                        {loadingEdit ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-zinc-900 rounded-2xl" />)}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Expense Title <span className="text-rose-400">*</span></label>
                                    <input type="text" value={form.title} onChange={set("title")} placeholder="e.g. AWS hosting bill"
                                        className={inputCls("title")} />
                                    {errors.title && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.title}</p>}
                                </div>

                                {/* Amount + Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Amount (₹) <span className="text-rose-400">*</span></label>
                                        <div className="relative">
                                            <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00"
                                                className={`${inputCls("amount")} pl-11`} />
                                        </div>
                                        {errors.amount && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Date <span className="text-rose-400">*</span></label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                            <input type="date" value={form.date} onChange={set("date")}
                                                className={`${inputCls("date")} pl-11 cursor-pointer [color-scheme:dark]`} />
                                        </div>
                                        {errors.date && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.date}</p>}
                                    </div>
                                </div>

                                {/* Category quick-picks */}
                                <div>
                                    <label className="block text-xs font-mono font-bold text-zinc-300 mb-2 uppercase tracking-wider">Category <span className="text-rose-400">*</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXPENSE_CATEGORIES.map(cat => {
                                            const style = CATEGORY_STYLE[cat];
                                            const Icon = style.icon;
                                            const active = form.category === cat;
                                            return (
                                                <button key={cat} type="button" onClick={() => set("category")(cat)}
                                                    className={`cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-2 rounded-xl border transition-all shadow-inner
                                                        ${active ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-zinc-950 border-transparent shadow-[0_0_15px_rgba(56,189,248,0.3)]" : `bg-zinc-900/80 ${style.badge} border-white/10 hover:border-white/20`}`}>
                                                    <Icon size={14} className={active ? "text-zinc-950 stroke-[3]" : ""} />
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.category && <p className="text-[11px] font-mono text-rose-400 mt-1.5">&gt; {errors.category}</p>}
                                </div>

                                {/* Payment mode */}
                                <div className="relative">
                                    <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Payment Mode <span className="text-rose-400">*</span></label>
                                    <div className="relative">
                                        <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                        <select value={form.paymentMode} onChange={set("paymentMode")}
                                            className={`${inputCls("paymentMode")} appearance-none pl-11 pr-11 cursor-pointer bg-zinc-950/80`}>
                                            <option value="" className="bg-zinc-900 text-zinc-500">Select payment mode</option>
                                            {PAYMENT_MODES.map(pm => <option key={pm} value={pm} className="bg-zinc-900 text-white">{pm}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                    {errors.paymentMode && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.paymentMode}</p>}
                                </div>

                                {/* Vendor */}
                                <div>
                                    <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Paid To / Vendor <span className="text-zinc-500 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                        <input type="text" value={form.vendor} onChange={set("vendor")} placeholder="e.g. Amazon Web Services"
                                            className={`${inputCls("vendor")} pl-11`} />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Notes <span className="text-zinc-500 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <StickyNote size={16} className="absolute left-4 top-3.5 text-cyan-400 z-10 pointer-events-none" />
                                        <textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Any extra detail about this expense..."
                                            className={`${inputCls("notes")} !h-auto py-3 pl-11 resize-none`} />
                                    </div>
                                </div>

                                {/* Recurring */}
                                <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 shadow-inner">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" checked={form.isRecurring} onChange={set("isRecurring")}
                                            className="cursor-pointer h-5 w-5 rounded-md accent-cyan-400 bg-zinc-900 border-white/10" />
                                        <span className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-white">
                                            <Repeat size={15} className="text-cyan-400" /> This is a recurring expense
                                        </span>
                                    </label>
                                    {form.isRecurring && (
                                        <div className="mt-4 pl-8">
                                            <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Frequency <span className="text-rose-400">*</span></label>
                                            <div className="relative max-w-[240px]">
                                                <select value={form.recurringFrequency} onChange={set("recurringFrequency")}
                                                    className={`${inputCls("recurringFrequency")} appearance-none pl-4 pr-10 cursor-pointer bg-zinc-900`}>
                                                    <option value="" className="bg-zinc-900 text-zinc-500">Select frequency</option>
                                                    {RECURRING_FREQUENCIES.map(f => <option key={f} value={f} className="bg-zinc-900 text-white">{f}</option>)}
                                                </select>
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                            {errors.recurringFrequency && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.recurringFrequency}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Live preview */}
                                {form.category && form.amount > 0 && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4 shadow-inner">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${selectedCategoryStyle.badge} border shadow-inner`}>
                                            {React.createElement(selectedCategoryStyle.icon, { size: 18, className: "stroke-[2.5]" })}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-mono font-bold text-white truncate tracking-wide">{form.title || "Untitled expense"}</p>
                                            <p className="text-xs font-mono text-cyan-300 mt-0.5">{form.category} · {formatCurrency(Number(form.amount) || 0)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-white/5">
                                    <div className="relative group cursor-pointer flex-1 sm:flex-none">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                        <button type="submit" disabled={submitting}
                                            className="relative cursor-pointer w-full sm:w-auto h-12 px-7 rounded-2xl bg-zinc-950 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                            {submitting ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : <Save size={16} className="text-cyan-400 stroke-[3]" />}
                                            <span>{isEditMode ? "Save Changes" : "Save Expense"}</span>
                                        </button>
                                    </div>
                                    <button type="button" onClick={isEditMode ? () => navigate("/admin/expenses") : resetForm} disabled={submitting}
                                        className="cursor-pointer h-12 px-6 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60 flex items-center justify-center gap-2">
                                        {isEditMode ? <X size={16} /> : <RotateCcw size={16} />}
                                        <span>{isEditMode ? "Cancel" : "Reset"}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* SIDEBAR — Recent Expenses */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-5 shrink-0">
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <Receipt size={18} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Recently Added</h3>
                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{recentLoading ? "Loading…" : `${formatCurrency(totalRecent)} across last ${recent.length}`}</p>
                                </div>
                            </div>
                            {recentLoading ? <SidebarSkeleton /> : recent.length === 0 ? (
                                <div className="border border-dashed border-white/10 rounded-2xl py-8 text-center bg-zinc-900/20">
                                    <Receipt size={26} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-xs font-mono text-zinc-400">No expenses yet</p>
                                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Your first one will show up here</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                                    {recent.map(exp => {
                                        const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
                                        const Icon = style.icon;
                                        return (
                                            <div key={exp._id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 transition shadow-inner">
                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                                                    <Icon size={14} className="stroke-[2.5]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-mono font-bold text-white truncate">{exp.title}</p>
                                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{fmtDate(exp.date)} · {exp.paymentMode}</p>
                                                </div>
                                                <p className="text-xs sm:text-sm font-mono font-black text-cyan-400 shrink-0">{formatCurrency(exp.amount)}</p>
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
        </DashboardLayout>
    );
};

export default AddExpense;