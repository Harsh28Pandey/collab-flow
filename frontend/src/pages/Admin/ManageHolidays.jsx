import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    LEAVE_TYPE_STYLE, STATUS_STYLE, HOLIDAY_STATUSES,
    fmtDate, formatDateRange,
} from "../../utils/holidayConstants.js";
import {
    RefreshCcw, Search, X, Check, Ban, CheckCircle2, AlertCircle, Loader2,
    CalendarCheck, MessageSquareText, UserRound, Inbox,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON / TOAST
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-[68px] bg-gray-100 rounded-2xl" />)}
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-3xl" />)}
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
// REVIEW MODAL (approve / reject with optional remarks)
// ─────────────────────────────────────────────────────────────────────────────

const ReviewModal = ({ request, action, onClose, onConfirm, submitting }) => {
    const [remarks, setRemarks] = useState("");

    useEffect(() => { setRemarks(""); }, [request, action]);

    if (!request || !action) return null;
    const isApprove = action === "Approved";

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-[26px] shadow-2xl p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isApprove ? "bg-green-100" : "bg-red-100"}`}>
                    {isApprove ? <Check size={22} className="text-green-600" /> : <Ban size={22} className="text-red-600" />}
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center">
                    {isApprove ? "Approve" : "Reject"} this request?
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1.5">
                    {request.user?.name || "This employee"}'s {request.leaveType} for {formatDateRange(request.fromDate, request.toDate)} ({request.totalDays} day{request.totalDays !== 1 ? "s" : ""}).
                </p>

                <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                        placeholder={isApprove ? "e.g. Approved, enjoy your time off!" : "e.g. Team is short-staffed that week"}
                        className="w-full h-auto py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                </div>

                <div className="flex items-center gap-3 mt-6">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={() => onConfirm(remarks)} disabled={submitting}
                        className={`cursor-pointer flex-1 h-11 rounded-2xl text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2
                            ${isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                        {submitting && <Loader2 size={15} className="animate-spin" />}
                        {isApprove ? "Approve" : "Reject"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST CARD
// ─────────────────────────────────────────────────────────────────────────────

const RequestCard = ({ h, onReview }) => {
    const typeStyle = LEAVE_TYPE_STYLE[h.leaveType] || LEAVE_TYPE_STYLE["Casual Leave"];
    const statusStyle = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
    const TypeIcon = typeStyle.icon;
    const StatusIcon = statusStyle.icon;
    const initials = (h.user?.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-sm">
                        {initials || <UserRound size={16} />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{h.user?.name || "Unknown employee"}</p>
                        <p className="text-xs text-gray-400 truncate">{h.user?.email}</p>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyle.badge}`}>
                    <StatusIcon size={12} /> {h.status}
                </span>
            </div>

            <div className="flex items-center gap-2.5 mt-4">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${typeStyle.badge}`}>
                    <TypeIcon size={15} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{h.leaveType}</p>
                    <p className="text-xs text-gray-500">{formatDateRange(h.fromDate, h.toDate)} · {h.totalDays} day{h.totalDays !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{h.reason}</p>

            {h.status !== "Pending" && h.adminRemarks && (
                <div className="flex items-start gap-2 mt-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                    <MessageSquareText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-700">Your note:</span> {h.adminRemarks}
                        {h.reviewedBy?.name && <span className="text-gray-400"> · reviewed by {h.reviewedBy.name}</span>}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">Applied on {fmtDate(h.createdAt)}</p>
                {h.status === "Pending" && (
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onReview(h, "Rejected")}
                            className="cursor-pointer h-9 px-3.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition">
                            <Ban size={13} /> Reject
                        </button>
                        <button type="button" onClick={() => onReview(h, "Approved")}
                            className="cursor-pointer h-9 px-3.5 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1.5 transition">
                            <Check size={13} /> Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN HOLIDAYS PAGE
// ─────────────────────────────────────────────────────────────────────────────

// "All" is now first in the tab order, so it renders as the leftmost/first tab.
const FILTER_TABS = ["All", "Pending", "Approved", "Rejected"];

const ManageHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // "All" is now the default active filter on page load.
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewAction, setReviewAction] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchHolidays = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await axiosInstance.get(API_PATHS.HOLIDAYS.GET_ALL);
            const raw = res.data?.holidays || res.data || [];
            setHolidays(Array.isArray(raw) ? raw : []);
        } catch (e) {
            console.log(e);
            showToast("Couldn't load holiday requests.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return holidays
            .filter(h => statusFilter === "All" || h.status === statusFilter)
            .filter(h => !q || (h.user?.name || "").toLowerCase().includes(q) || (h.reason || "").toLowerCase().includes(q) || (h.leaveType || "").toLowerCase().includes(q));
    }, [holidays, statusFilter, searchQuery]);

    const stats = useMemo(() => ({
        total: holidays.length,
        pending: holidays.filter(h => h.status === "Pending").length,
        approved: holidays.filter(h => h.status === "Approved").length,
        rejected: holidays.filter(h => h.status === "Rejected").length,
    }), [holidays]);

    const openReview = (h, action) => { setReviewTarget(h); setReviewAction(action); };

    const handleReviewConfirm = async (remarks) => {
        if (!reviewTarget || !reviewAction) return;
        try {
            setSubmitting(true);
            await axiosInstance.put(API_PATHS.HOLIDAYS.REVIEW(reviewTarget._id), { status: reviewAction, adminRemarks: remarks });
            showToast(`Request ${reviewAction.toLowerCase()} successfully`);
            setReviewTarget(null);
            setReviewAction(null);
            fetchHolidays({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Something went wrong. Try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const hasData = holidays.length > 0;

    return (
        <DashboardLayout activeMenu="Manage Holidays">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Holidays</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and approve your team's time-off requests</p>
                    </div>
                    <button type="button" onClick={() => fetchHolidays({ isRefresh: true })} disabled={loading || refreshing}
                        className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all self-start sm:self-auto">
                        <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {loading ? <Skeleton /> : (
                    <>
                        {/* STAT PILLS */}
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
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Rejected</p>
                                <p className="text-lg font-bold text-red-600 mt-1">{stats.rejected}</p>
                            </div>
                        </div>

                        {/* FILTERS + SEARCH */}
                        {hasData && (
                            <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 overflow-x-auto">
                                    {FILTER_TABS.map(tab => (
                                        <button key={tab} type="button" onClick={() => setStatusFilter(tab)}
                                            className={`cursor-pointer px-4 h-9 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                                                ${statusFilter === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                            {tab}{tab !== "All" && ` (${holidays.filter(h => h.status === tab).length})`}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search employee, reason or leave type..."
                                        className="w-full h-10 pl-10 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                </div>
                            </div>
                        )}

                        {/* LIST */}
                        {!hasData ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                                <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <Inbox size={28} className="text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">No holiday requests</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                    When your team applies for time off, their requests will show up here for approval.
                                </p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-14 text-center">
                                <CalendarCheck size={26} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} requests found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filtered.map(h => <RequestCard key={h._id} h={h} onReview={openReview} />)}
                            </div>
                        )}
                    </>
                )}
            </div>

            <ReviewModal
                request={reviewTarget}
                action={reviewAction}
                submitting={submitting}
                onClose={() => { setReviewTarget(null); setReviewAction(null); }}
                onConfirm={handleReviewConfirm}
            />
            <Toast toast={toast} onClose={() => setToast(null)} />

            <style>{`
                @keyframes modalPop { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
                @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </DashboardLayout>
    );
};

export default ManageHolidays;