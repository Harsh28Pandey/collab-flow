// src/pages/Admin/ManageHolidays.jsx
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
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON / TOAST (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[76px] bg-zinc-900/60 border border-white/5 rounded-2xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-44 bg-zinc-950/60 border border-white/10 rounded-[2rem]" />
            ))}
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
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-mono font-bold
                ${ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-xl" : "bg-rose-500/10 border-rose-500/30 text-rose-400 backdrop-blur-xl"}`}>
                {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all">
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
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="relative w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 animate-[modalPop_.25s_ease] overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Top Glow Line */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-${isApprove ? 'emerald' : 'rose'}-500 to-transparent shadow-[0_0_12px_rgba(${isApprove ? '16,185,129' : '244,63,94'},0.8)]`}></div>

                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 border shadow-inner ${isApprove ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                    {isApprove ? <Check size={24} className="text-emerald-400 stroke-[3]" /> : <Ban size={24} className="text-rose-400 stroke-[3]" />}
                </div>

                <h3 className="text-lg sm:text-xl font-mono font-black text-white text-center tracking-wide">
                    {isApprove ? "Approve" : "Reject"} this request?
                </h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 text-center mt-2 leading-relaxed">
                    {request.user?.name || "This employee"}'s <span className="text-white font-bold">{request.leaveType}</span> for {formatDateRange(request.fromDate, request.toDate)} ({request.totalDays} day{request.totalDays !== 1 ? "s" : ""}).
                </p>

                <div className="mt-6">
                    <label className="block text-xs font-mono font-bold text-zinc-300 mb-2 uppercase tracking-wider">Remarks <span className="text-zinc-500 font-normal">(optional)</span></label>
                    <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                        placeholder={isApprove ? "e.g. Approved, enjoy your time off!" : "e.g. Team is short-staffed that week"}
                        className="w-full h-auto py-3 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner resize-none" />
                </div>

                <div className="flex items-center gap-3 mt-7 pt-5 border-t border-white/5">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={() => onConfirm(remarks)} disabled={submitting}
                        className={`cursor-pointer flex-1 h-11 rounded-2xl text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border disabled:opacity-60
                            ${isApprove ? "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-400" : "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30 text-rose-400"}`}>
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        {isApprove ? "Approve" : "Reject"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST CARD (Bento Glassmorphism)
// ─────────────────────────────────────────────────────────────────────────────

const RequestCard = ({ h, onReview }) => {
    const typeStyle = LEAVE_TYPE_STYLE[h.leaveType] || LEAVE_TYPE_STYLE["Casual Leave"];
    const statusStyle = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
    const TypeIcon = typeStyle.icon;
    const StatusIcon = statusStyle.icon;
    const initials = (h.user?.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    // Mapping light-mode colors to dark-mode bento styles safely
    const getBadgeStyle = (status) => {
        switch (status) {
            case "Approved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Rejected": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-amber-500/10 text-amber-400 border-amber-500/20"; // Pending
        }
    };

    return (
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 hover:border-white/20 transition-all duration-300 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between">

            <div>
                {/* User Info & Status */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 font-mono font-black text-xs shadow-inner">
                            {initials || <UserRound size={16} />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-mono font-bold text-white truncate tracking-wide">{h.user?.name || "Unknown employee"}</p>
                            <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">{h.user?.email}</p>
                        </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner shrink-0 ${getBadgeStyle(h.status)}`}>
                        <StatusIcon size={12} className="stroke-[2.5]" /> {h.status}
                    </span>
                </div>

                {/* Leave Details */}
                <div className="flex items-center gap-3 mt-5 bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                        <TypeIcon size={16} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-[13px] font-mono font-bold text-white">{h.leaveType}</p>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{formatDateRange(h.fromDate, h.toDate)} · {h.totalDays} day{h.totalDays !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                <p className="text-xs sm:text-sm font-mono text-zinc-300 mt-4 leading-relaxed line-clamp-3">
                    <span className="text-zinc-500 font-bold mr-1">Reason:</span>{h.reason}
                </p>

                {h.status !== "Pending" && h.adminRemarks && (
                    <div className="flex items-start gap-2.5 mt-4 rounded-xl border border-white/5 bg-zinc-900/80 p-3 shadow-inner">
                        <MessageSquareText size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-mono text-zinc-300 leading-relaxed">
                            <span className="font-bold text-cyan-400">Your note: </span> {h.adminRemarks}
                            {h.reviewedBy?.name && <span className="text-zinc-500 block mt-1">Reviewed by {h.reviewedBy.name}</span>}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-zinc-500 font-bold">Applied: {fmtDate(h.createdAt)}</p>
                {h.status === "Pending" && (
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onReview(h, "Rejected")}
                            className="cursor-pointer h-8 sm:h-9 px-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-inner active:scale-95">
                            <Ban size={12} className="stroke-[3]" /> Reject
                        </button>
                        <button type="button" onClick={() => onReview(h, "Approved")}
                            className="cursor-pointer h-8 sm:h-9 px-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-inner active:scale-95">
                            <Check size={12} className="stroke-[3]" /> Approve
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

const ManageHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    // Format tabs data for TaskStatusTabs
    const TABS = useMemo(() => [
        { label: "All", count: stats.total },
        { label: "Pending", count: stats.pending },
        { label: "Approved", count: stats.approved },
        { label: "Rejected", count: stats.rejected },
    ], [stats]);

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
            <div className="space-y-6">

                {/* ───────────────── HEADER ───────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">Manage Holidays</h1>
                        {/* Always visible description */}
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">Review and approve your team's time-off requests</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button type="button" onClick={() => fetchHolidays({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-10 px-4 sm:h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            {/* Always visible refresh text */}
                            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
                        </button>
                    </div>
                </div>

                {loading ? <Skeleton /> : (
                    <>
                        {/* ───────────────── STAT PILLS ───────────────── */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-3.5 shadow-inner">
                                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Requests</p>
                                <p className="text-xl font-mono font-black text-white mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-amber-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full"></div>
                                <p className="text-[10px] font-mono text-amber-500/70 uppercase tracking-wider relative z-10">Pending</p>
                                <p className="text-xl font-mono font-black text-amber-400 mt-1 relative z-10">{stats.pending}</p>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full"></div>
                                <p className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-wider relative z-10">Approved</p>
                                <p className="text-xl font-mono font-black text-emerald-400 mt-1 relative z-10">{stats.approved}</p>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-rose-500/20 rounded-2xl px-4 py-3.5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl rounded-full"></div>
                                <p className="text-[10px] font-mono text-rose-500/70 uppercase tracking-wider relative z-10">Rejected</p>
                                <p className="text-xl font-mono font-black text-rose-400 mt-1 relative z-10">{stats.rejected}</p>
                            </div>
                        </div>

                        {/* ───────────────── FILTERS + SEARCH ───────────────── */}
                        {hasData && (
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2">

                                {/* Search Bar on Left */}
                                <div className="relative flex-1 max-w-xl">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search employee, reason or type..."
                                        className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner" />
                                </div>

                                {/* Tabs / Filters on Right (Clean Inline Style) */}
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

                        {/* ───────────────── LIST ───────────────── */}
                        {!hasData ? (
                            <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                                    <Inbox size={36} className="text-cyan-400" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">No holiday requests</h3>
                                <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                                    When your team applies for time off, their requests will show up here for approval.
                                </p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-16 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
                                    <CalendarCheck size={26} className="text-zinc-500" />
                                </div>
                                <p className="text-sm font-mono font-bold text-white">No {statusFilter !== "All" ? statusFilter : "matching"} requests found</p>
                                <p className="text-xs font-mono text-zinc-500 mt-1">Try a different search term or filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
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
                @keyframes modalPop { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn .2s ease; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </DashboardLayout>
    );
};

export default ManageHolidays;