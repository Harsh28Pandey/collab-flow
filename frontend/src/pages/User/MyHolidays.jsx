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
    Palmtree, CalendarRange, MessageSquareText, Info,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON / TOAST
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-[68px] bg-gray-100 rounded-2xl" />)}
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-3xl" />)}
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

    const inputCls = (field) => `w-full h-11 px-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 transition
        ${errors[field] ? "border-red-300 focus:ring-red-400 bg-red-50/40" : "border-gray-200 focus:ring-blue-500"}`;

    const days = form.fromDate && form.toDate && new Date(form.toDate) >= new Date(form.fromDate) ? calcDays(form.fromDate, form.toDate) : 0;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-[26px] shadow-2xl max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                            {initialData ? <Pencil size={18} className="text-blue-600" /> : <Palmtree size={19} className="text-blue-600" />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">{initialData ? "Edit Holiday Request" : "Apply for Holiday"}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Goes to your admin for approval</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Leave Type <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {LEAVE_TYPES.map(lt => {
                                const style = LEAVE_TYPE_STYLE[lt];
                                const Icon = style.icon;
                                const active = form.leaveType === lt;
                                return (
                                    <button key={lt} type="button" onClick={() => set("leaveType")({ target: { value: lt } })}
                                        className={`cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-2xl border transition-all
                                            ${active ? `${style.solid} text-white border-transparent` : `bg-white ${style.badge} hover:brightness-95`}`}>
                                        <Icon size={13} />
                                        {lt}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.leaveType && <p className="text-[11px] text-red-500 mt-1.5">{errors.leaveType}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">From Date <span className="text-red-500">*</span></label>
                            <input type="date" value={form.fromDate} onChange={set("fromDate")} className={`${inputCls("fromDate")} cursor-pointer`} />
                            {errors.fromDate && <p className="text-[11px] text-red-500 mt-1">{errors.fromDate}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">To Date <span className="text-red-500">*</span></label>
                            <input type="date" value={form.toDate} onChange={set("toDate")} className={`${inputCls("toDate")} cursor-pointer`} />
                            {errors.toDate && <p className="text-[11px] text-red-500 mt-1">{errors.toDate}</p>}
                        </div>
                    </div>

                    {days > 0 && (
                        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                            <CalendarRange size={15} className="text-blue-600 shrink-0" />
                            <p className="text-xs text-blue-700">This request covers <span className="font-semibold">{days} day{days !== 1 ? "s" : ""}</span>.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason <span className="text-red-500">*</span></label>
                        <textarea rows={3} value={form.reason} onChange={set("reason")} placeholder="Briefly explain why you need this time off..."
                            className={`${inputCls("reason")} !h-auto py-3 resize-none`} />
                        {errors.reason && <p className="text-[11px] text-red-500 mt-1">{errors.reason}</p>}
                    </div>
                </form>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2">
                        {submitting && <Loader2 size={15} className="animate-spin" />}
                        {initialData ? "Save Changes" : "Submit Request"}
                    </button>
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
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-[26px] shadow-2xl p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center">Withdraw this request?</h3>
                <p className="text-sm text-gray-500 text-center mt-1.5">
                    Your {holiday.leaveType} request for {formatDateRange(holiday.fromDate, holiday.toDate)} will be removed.
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
// HOLIDAY CARD
// ─────────────────────────────────────────────────────────────────────────────

const HolidayCard = ({ h, onEdit, onDelete }) => {
    const typeStyle = LEAVE_TYPE_STYLE[h.leaveType] || LEAVE_TYPE_STYLE["Casual Leave"];
    const statusStyle = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
    const TypeIcon = typeStyle.icon;
    const StatusIcon = statusStyle.icon;
    const canModify = h.status === "Pending";

    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${typeStyle.badge}`}>
                        <TypeIcon size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900">{h.leaveType}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDateRange(h.fromDate, h.toDate)} · {h.totalDays} day{h.totalDays !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyle.badge}`}>
                    <StatusIcon size={12} /> {h.status}
                </span>
            </div>

            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{h.reason}</p>

            {h.status !== "Pending" && h.adminRemarks && (
                <div className="flex items-start gap-2 mt-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                    <MessageSquareText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Admin note:</span> {h.adminRemarks}</p>
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">Applied on {fmtDate(h.createdAt)}</p>
                {canModify ? (
                    <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => onEdit(h)} title="Edit request" aria-label="Edit request"
                            className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 flex items-center justify-center transition">
                            <Pencil size={14} className="text-blue-600" />
                        </button>
                        <button type="button" onClick={() => onDelete(h)} title="Delete request" aria-label="Delete request"
                            className="cursor-pointer h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 active:bg-red-100 flex items-center justify-center transition">
                            <Trash2 size={14} className="text-red-600" />
                        </button>
                    </div>
                ) : (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Info size={12} /> Locked after review</span>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", ...HOLIDAY_STATUSES];

const MyHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");

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

    const filtered = useMemo(() => {
        if (statusFilter === "All") return holidays;
        return holidays.filter(h => h.status === statusFilter);
    }, [holidays, statusFilter]);

    const stats = useMemo(() => ({
        total: holidays.length,
        pending: holidays.filter(h => h.status === "Pending").length,
        approved: holidays.filter(h => h.status === "Approved").length,
        rejected: holidays.filter(h => h.status === "Rejected").length,
        daysApproved: holidays.filter(h => h.status === "Approved").reduce((s, h) => s + h.totalDays, 0),
    }), [holidays]);

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
            showToast("Holiday request deleted");
            setDeleteTarget(null);
            fetchHolidays({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't delete this request.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const hasData = holidays.length > 0;

    return (
        <DashboardLayout activeMenu="Holidays">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Holidays</h1>
                        <p className="text-sm text-gray-500 mt-1">Apply for time off and track approval status</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchHolidays({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 w-11 sm:w-auto sm:px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button type="button" onClick={openApply}
                            className="cursor-pointer h-11 px-4 sm:px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-blue-200">
                            <Plus size={17} />
                            Apply for Holiday
                        </button>
                    </div>
                </div>

                {loading ? <Skeleton /> : (
                    <>
                        {/* STAT PILLS */}
                        {hasData && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Total Requests</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Pending</p>
                                    <p className="text-lg font-bold text-amber-600 mt-1">{stats.pending}</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Approved</p>
                                    <p className="text-lg font-bold text-green-600 mt-1">{stats.approved}</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Days Approved</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{stats.daysApproved}</p>
                                </div>
                            </div>
                        )}

                        {/* FILTER TABS */}
                        {hasData && (
                            <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 w-full sm:w-fit overflow-x-auto">
                                {FILTER_TABS.map(tab => (
                                    <button key={tab} type="button" onClick={() => setStatusFilter(tab)}
                                        className={`cursor-pointer px-4 h-9 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                                            ${statusFilter === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                        {tab}{tab !== "All" && ` (${holidays.filter(h => h.status === tab).length})`}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* LIST */}
                        {!hasData ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                                <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <Palmtree size={28} className="text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">No holiday requests yet</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                    Planning some time off? Submit a request and your admin will review it.
                                </p>
                                <button type="button" onClick={openApply}
                                    className="cursor-pointer mt-5 h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2">
                                    <Plus size={16} /> Apply for Holiday
                                </button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-14 text-center">
                                <p className="text-sm text-gray-500">No {statusFilter.toLowerCase()} requests</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

            <style>{`
                @keyframes modalPop { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
                @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </DashboardLayout>
    );
};

export default MyHolidays;