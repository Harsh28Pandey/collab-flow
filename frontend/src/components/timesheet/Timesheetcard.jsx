import React from "react";
import {
    Calendar,
    FolderKanban,
    Clock3,
    TimerReset,
    CheckCircle2,
    XCircle,
    Hourglass,
} from "lucide-react";

const STATUS_STYLES = {
    Pending: {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: Hourglass,
    },
    Approved: {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
    },
    Rejected: {
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        icon: XCircle,
    },
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const Timesheetcard = ({ timesheet, onView, onApprove, onReject }) => {

    const status = timesheet.status || "Pending";
    const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.Pending;
    const StatusIcon = statusConfig.icon;

    const employeeName =
        timesheet.employeeName || timesheet.employee?.name || "Unknown";

    const initial = employeeName?.charAt(0)?.toUpperCase() || "?";

    const profileImageUrl =
        timesheet.employee?.profileImageUrl || timesheet.profileImageUrl;

    return (
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 sm:p-5 hover:border-white/20 transition-all duration-300 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between">

            {/* TOP ROW */}
            <div className="flex items-start justify-between gap-3 flex-wrap">

                <button
                    type="button"
                    onClick={() => onView?.(timesheet)}
                    className="cursor-pointer flex items-center gap-3 text-left min-w-0 flex-1 group"
                >
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={employeeName}
                            className="h-11 w-11 rounded-2xl object-cover shrink-0 border border-white/10 bg-zinc-900 shadow-inner"
                        />
                    ) : (
                        <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-black text-xs uppercase shrink-0 shadow-inner">
                            {initial}
                        </div>
                    )}

                    <div className="min-w-0">
                        <h3 className="text-sm font-mono font-bold text-white truncate tracking-wide group-hover:text-cyan-400 transition-colors">
                            {employeeName}
                        </h3>

                        <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                            {timesheet.employeeEmail || timesheet.employee?.email || ""}
                        </p>
                    </div>
                </button>

                <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner ${statusConfig.badge}`}
                >
                    <StatusIcon size={12} className="stroke-[2.5]" />
                    {status}
                </span>
            </div>

            {/* DETAILS GRID */}
            <button
                type="button"
                onClick={() => onView?.(timesheet)}
                className="cursor-pointer w-full text-left mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            >

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <Calendar size={13} className="text-cyan-400" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            Date
                        </span>
                    </div>

                    <p className="text-xs font-mono font-bold text-zinc-200 truncate">
                        {formatDate(timesheet.date)}
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <FolderKanban size={13} className="text-purple-400" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            Project
                        </span>
                    </div>

                    <p className="text-xs font-mono font-bold text-zinc-200 truncate">
                        {timesheet.project || "—"}
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <Clock3 size={13} className="text-emerald-400" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            Hours
                        </span>
                    </div>

                    <p className="text-xs font-mono font-bold text-zinc-200 truncate">
                        {timesheet.totalHours ?? 0} hrs
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <TimerReset size={13} className="text-amber-400" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            Overtime
                        </span>
                    </div>

                    <p className="text-xs font-mono font-bold text-zinc-200 truncate">
                        {timesheet.overtimeHours ?? 0} hrs
                    </p>
                </div>
            </button>

            {/* ACTIONS */}
            {status === "Pending" && (
                <div className="flex flex-col sm:flex-row gap-2.5 mt-4 pt-3 border-t border-white/5">

                    <button
                        type="button"
                        onClick={() => onApprove?.(timesheet)}
                        className="cursor-pointer flex-1 h-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-inner active:scale-95"
                    >
                        <CheckCircle2 size={14} className="stroke-[2.5]" />
                        Approve
                    </button>

                    <button
                        type="button"
                        onClick={() => onReject?.(timesheet)}
                        className="cursor-pointer flex-1 h-10 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-inner active:scale-95"
                    >
                        <XCircle size={14} className="stroke-[2.5]" />
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};

export default Timesheetcard;