import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    LEAVE_TYPES, LEAVE_TYPE_STYLE, STATUS_STYLE, HOLIDAY_STATUSES,
    fmtDate, toInputDate, calcDays, formatDateRange,
} from "../../utils/holidayConstants.js";
import {
    Plus, RefreshCcw, X, Pencil, Trash2, CheckCircle2, AlertCircle, Loader2,
    Palmtree, CalendarRange, MessageSquareText, Info, Search
} from "lucide-react";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON / TOAST (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const Skeleton = () => (
    <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-[76px] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-40 rounded-[2rem]" />)}
        </div>
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
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-sm font-mono font-bold backdrop-blur-xl
                ${ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                {ok ? <CheckCircle2 size={17} className="stroke-[2.5]" /> : <AlertCircle size={17} className="stroke-[2.5]" />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY / EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { leaveType: "", fromDate: "", toDate: "", reason: "" };

const HolidayFormModal = ({ open, initialData, onClose, onSubmit, submitting }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        if (initialData) {
            setForm({
                leaveType: initialData.leaveType,
                fromDate: toInputDate(initialData.fromDate),
                toDate: toInputDate(initialData.toDate),
                reason: initialData.reason || "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [open, initialData]);

    if (!open) return null;

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.leaveType) errs.leaveType = "Select a leave type";
        if (!form.fromDate) errs.fromDate = "Start date is required";
        if (!form.toDate) errs.toDate = "End date is required";
        if (form.fromDate && form.toDate && new Date(form.toDate) < new Date(form.fromDate)) errs.toDate = "End date can't be before start date";
        if (!form.reason.trim()) errs.reason = "Reason is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(form);
    };

    const inputCls = (field) => `w-full h-12 px-4 rounded-2xl border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 transition [color-scheme:dark]
        ${errors[field] ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white" : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600 shadow-inner"}`;

    const days = form.fromDate && form.toDate && new Date(form.toDate) >= new Date(form.fromDate) ? calcDays(form.fromDate, form.toDate) : 0;

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 py-8 animate-fadeIn overflow-hidden" onClick={onClose}>
            <div className="w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease] m-auto relative" onClick={e => e.stopPropagation()}>

                {/* Top Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>

                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            {initialData ? <Pencil size={18} className="text-cyan-400" /> : <Palmtree size={20} className="text-cyan-400" />}
                        </div>
                        <div>
                            <h2 className="text-base font-mono font-black text-white tracking-wide">{initialData ? "Edit Holiday Request" : "Apply for Holiday"}</h2>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">Goes to your admin for approval</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition text-zinc-400 hover:text-white shadow-inner">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar">
                    <div>
                        <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-2 uppercase tracking-wider">Leave Type <span className="text-rose-400">*</span></label>
                        <div className="flex flex-wrap gap-2.5">
                            {LEAVE_TYPES.map(lt => {
                                const style = LEAVE_TYPE_STYLE[lt];
                                const Icon = style.icon;
                                const active = form.leaveType === lt;
                                return (
                                    <button key={lt} type="button" onClick={() => set("leaveType")({ target: { value: lt } })}
                                        className={`cursor-pointer flex items-center gap-2 text-xs font-mono font-bold px-3.5 py-2 rounded-xl border transition-all shadow-inner active:scale-95
                                            ${active ? `bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]` : `bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800`}`}>
                                        <Icon size={14} className={active ? "stroke-[2.5]" : ""} />
                                        {lt}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.leaveType && <p className="text-[11px] font-mono text-rose-400 mt-2">&gt; {errors.leaveType}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">From Date <span className="text-rose-400">*</span></label>
                            <input type="date" value={form.fromDate} onChange={set("fromDate")} className={`${inputCls("fromDate")} cursor-pointer`} />
                            {errors.fromDate && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.fromDate}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">To Date <span className="text-rose-400">*</span></label>
                            <input type="date" value={form.toDate} onChange={set("toDate")} className={`${inputCls("toDate")} cursor-pointer`} />
                            {errors.toDate && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.toDate}</p>}
                        </div>
                    </div>

                    {days > 0 && (
                        <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3.5 shadow-inner">
                            <CalendarRange size={16} className="text-cyan-400 shrink-0 stroke-[2.5]" />
                            <p className="text-xs font-mono text-cyan-100">This request covers <span className="font-bold text-cyan-400">{days} day{days !== 1 ? "s" : ""}</span>.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Reason <span className="text-rose-400">*</span></label>
                        <textarea rows={3} value={form.reason} onChange={set("reason")} placeholder="Briefly explain why you need this time off..."
                            className={`${inputCls("reason")} !h-auto py-3 resize-none`} />
                        {errors.reason && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.reason}</p>}
                    </div>
                </form>

                <div className="px-6 py-5 border-t border-white/5 flex items-center justify-end gap-3 shrink-0 bg-zinc-950/40">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="relative cursor-pointer h-11 px-6 rounded-2xl bg-zinc-950 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center gap-2">
                            {submitting && <Loader2 size={15} className="animate-spin text-cyan-400" />}
                            <span>{initialData ? "Save Changes" : "Submit Request"}</span>
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

const ConfirmDeleteModal = ({ holiday, onClose, onConfirm, deleting }) => {
    if (!holiday) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 animate-[modalPop_.2s_ease] relative overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Top Ambient Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Trash2 size={24} className="text-rose-400 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-mono font-black text-white text-center tracking-wide">Withdraw request?</h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 text-center mt-2 leading-relaxed">
                    Your <span className="text-white font-bold">{holiday.leaveType}</span> request for <span className="text-white font-bold">{formatDateRange(holiday.fromDate, holiday.toDate)}</span> will be removed.
                </p>
                <div className="flex items-center gap-3 mt-7 pt-5 border-t border-white/5">
                    <button type="button" onClick={onClose} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono font-bold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg active:scale-95">
                        {deleting && <Loader2 size={15} className="animate-spin" />}
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY CARD
// ─────────────────────────────────────────────────────────────────────────────

const HolidayCard = ({ h, onEdit, onDelete }) => {
    const typeStyle = LEAVE_TYPE_STYLE[h.leaveType] || LEAVE_TYPE_STYLE["Casual Leave"];
    const statusStyle = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
    const TypeIcon = typeStyle.icon;
    const StatusIcon = statusStyle.icon;
    const canModify = h.status === "Pending";

    // Adding dark theme badge overrides for standard constant styles
    const badgeBgOverrides = {
        "Pending": "bg-amber-500/10 text-amber-400 border-amber-500/20",
        "Approved": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        "Rejected": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    const statusBadgeClass = badgeBgOverrides[h.status] || statusStyle.badge;

    return (
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${typeStyle.badge}`}>
                        <TypeIcon size={20} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 mt-0.5">
                        <p className="text-sm font-mono font-bold text-white tracking-wide">{h.leaveType}</p>
                        <p className="text-xs font-mono text-zinc-400 mt-1">{formatDateRange(h.fromDate, h.toDate)} · {h.totalDays} day{h.totalDays !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border shadow-inner shrink-0 ${statusBadgeClass}`}>
                    <StatusIcon size={12} className="stroke-[2.5]" /> {h.status}
                </span>
            </div>

            <p className="text-xs sm:text-sm font-mono text-zinc-300 mt-5 leading-relaxed flex-1">{h.reason}</p>

            {h.status !== "Pending" && h.adminRemarks && (
                <div className="flex items-start gap-2.5 mt-4 rounded-xl border border-white/5 bg-zinc-900/50 p-3.5 shadow-inner">
                    <MessageSquareText size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-mono text-zinc-300"><span className="font-bold text-cyan-400">Admin note:</span> {h.adminRemarks}</p>
                </div>
            )}

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-zinc-500">Applied on {fmtDate(h.createdAt)}</p>
                {canModify ? (
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onEdit(h)} title="Edit request" aria-label="Edit request"
                            className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 flex items-center justify-center transition shadow-inner">
                            <Pencil size={14} className="text-cyan-400" />
                        </button>
                        <button type="button" onClick={() => onDelete(h)} title="Withdraw request" aria-label="Withdraw request"
                            className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 active:scale-95 flex items-center justify-center transition shadow-inner">
                            <Trash2 size={14} className="text-rose-400" />
                        </button>
                    </div>
                ) : (
                    <span className="text-[10px] font-mono font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider"><Info size={13} className="stroke-[2.5]" /> Locked</span>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const MyHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState(""); // State for search

    const [formOpen, setFormOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchHolidays = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await axiosInstance.get(API_PATHS.HOLIDAYS.GET_MY);
            const raw = res.data?.holidays || res.data || [];
            setHolidays(Array.isArray(raw) ? raw : []);
        } catch (e) {
            console.log(e);
            showToast("Couldn't load your holiday requests.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

    const stats = useMemo(() => ({
        total: holidays.length,
        pending: holidays.filter(h => h.status === "Pending").length,
        approved: holidays.filter(h => h.status === "Approved").length,
        rejected: holidays.filter(h => h.status === "Rejected").length,
        daysApproved: holidays.filter(h => h.status === "Approved").reduce((s, h) => s + h.totalDays, 0),
    }), [holidays]);

    const TABS = useMemo(() => [
        { label: "All", count: stats.total },
        { label: "Pending", count: stats.pending },
        { label: "Approved", count: stats.approved },
        { label: "Rejected", count: stats.rejected }
    ], [stats]);


    const filtered = useMemo(() => {
        return holidays.filter(h => {
            const matchesTab = statusFilter === "All" || h.status === statusFilter;
            const search = searchQuery.toLowerCase();
            const matchesSearch =
                h.leaveType.toLowerCase().includes(search) ||
                h.reason.toLowerCase().includes(search) ||
                (h.adminRemarks && h.adminRemarks.toLowerCase().includes(search));

            return matchesTab && matchesSearch;
        });
    }, [holidays, statusFilter, searchQuery]);


    const openApply = () => { setEditingHoliday(null); setFormOpen(true); };
    const openEdit = (h) => { setEditingHoliday(h); setFormOpen(true); };

    const handleFormSubmit = async (form) => {
        try {
            setSubmitting(true);
            if (editingHoliday) {
                await axiosInstance.put(API_PATHS.HOLIDAYS.UPDATE(editingHoliday._id), form);
                showToast("Holiday request updated successfully");
            } else {
                await axiosInstance.post(API_PATHS.HOLIDAYS.APPLY, form);
                showToast("Holiday request submitted successfully");
            }
            setFormOpen(false);
            setEditingHoliday(null);
            fetchHolidays({ isRefresh: true });
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
            await axiosInstance.delete(API_PATHS.HOLIDAYS.DELETE(deleteTarget._id));
            showToast("Holiday request withdrawn");
            setDeleteTarget(null);
            fetchHolidays({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't withdraw this request.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const hasData = holidays.length > 0;

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
        <DashboardLayout activeMenu="Holidays">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Holidays</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Apply for time off and track approval status</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto">
                        <button type="button" onClick={() => fetchHolidays({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer flex-1 sm:flex-none h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span>Refresh</span>
                        </button>
                        <div className="relative group cursor-pointer flex-1 sm:flex-none">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={openApply}
                                className="relative cursor-pointer w-full sm:w-auto h-11 px-4 sm:px-5 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                                <Plus size={16} className="text-cyan-400 stroke-[3]" />
                                Apply for Holiday
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? <Skeleton /> : (
                    <>
                        {/* STAT PILLS */}
                        {hasData && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-blue-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full pointer-events-none"></div>
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider relative z-10">Total Requests</p>
                                    <p className="text-xl font-mono font-black text-white mt-1 relative z-10">{stats.total}</p>
                                </div>
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-amber-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full pointer-events-none"></div>
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider relative z-10">Pending</p>
                                    <p className="text-xl font-mono font-black text-amber-400 mt-1 relative z-10">{stats.pending}</p>
                                </div>
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full pointer-events-none"></div>
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider relative z-10">Approved</p>
                                    <p className="text-xl font-mono font-black text-emerald-400 mt-1 relative z-10">{stats.approved}</p>
                                </div>
                                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-purple-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full pointer-events-none"></div>
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider relative z-10">Days Approved</p>
                                    <p className="text-xl font-mono font-black text-white mt-1 relative z-10">{stats.daysApproved}</p>
                                </div>
                            </div>
                        )}

                        {/* Search + Stats (TaskStatusTabs Style) */}
                        {hasData && (
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2">

                                {/* Search */}
                                <div className="relative flex-1 max-w-xl">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by leave type or reason..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner"
                                    />
                                </div>

                                {/* Stats Tabs */}
                                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">
                                    <div className="min-w-max">
                                        <TaskStatusTabs
                                            tabs={TABS}
                                            activeTab={statusFilter}
                                            setActiveTab={setStatusFilter}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* LIST */}
                        {!hasData ? (
                            <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                                    <Palmtree size={36} className="text-cyan-400" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">No holiday requests yet</h3>
                                <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                                    Planning some time off? Submit a request and your admin will review it.
                                </p>
                                <div className="relative group cursor-pointer mt-7">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                    <button type="button" onClick={openApply}
                                        className="relative cursor-pointer h-12 px-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95">
                                        <Plus size={18} className="text-cyan-400 stroke-[3]" />
                                        Apply for Holiday
                                    </button>
                                </div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-3xl py-14 text-center mt-4">
                                <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">No requests match your filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
                                {filtered.map(h => (
                                    <HolidayCard key={h._id} h={h} onEdit={openEdit} onDelete={setDeleteTarget} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <HolidayFormModal
                open={formOpen}
                initialData={editingHoliday}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditingHoliday(null); }}
                onSubmit={handleFormSubmit}
            />
            <ConfirmDeleteModal holiday={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
            <Toast toast={toast} onClose={() => setToast(null)} />

        </DashboardLayout>
    );
};

export default MyHolidays;