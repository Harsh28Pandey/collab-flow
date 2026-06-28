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
        badge: "bg-amber-50 text-amber-600 border-amber-200",
        icon: Hourglass,
    },
    Approved: {
        badge: "bg-green-50 text-green-600 border-green-200",
        icon: CheckCircle2,
    },
    Rejected: {
        badge: "bg-red-50 text-red-600 border-red-200",
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

const TimesheetCard = ({ timesheet, onView, onApprove, onReject }) => {

    const status = timesheet.status || "Pending";
    const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.Pending;
    const StatusIcon = statusConfig.icon;

    const employeeName =
        timesheet.employeeName || timesheet.employee?.name || "Unknown";

    const initial = employeeName?.charAt(0)?.toUpperCase() || "?";

    const profileImageUrl =
        timesheet.employee?.profileImageUrl || timesheet.profileImageUrl;

    return (
        <div className="border border-gray-200 rounded-3xl p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all">

            {/* TOP ROW */}
            <div className="flex items-start justify-between gap-3">

                <button
                    type="button"
                    onClick={() => onView?.(timesheet)}
                    className="cursor-pointer flex items-center gap-3 text-left min-w-0 flex-1 group"
                >
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={employeeName}
                            className="h-11 w-11 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                        />
                    ) : (
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold uppercase shrink-0">
                            {initial}
                        </div>
                    )}

                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {employeeName}
                        </h3>

                        <p className="text-xs text-gray-500 truncate">
                            {timesheet.employeeEmail || timesheet.employee?.email || ""}
                        </p>
                    </div>
                </button>

                <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.badge}`}
                >
                    <StatusIcon size={13} />
                    {status}
                </span>
            </div>

            {/* DETAILS GRID */}
            <button
                type="button"
                onClick={() => onView?.(timesheet)}
                className="cursor-pointer w-full text-left mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >

                <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <Calendar size={13} />
                        <span className="text-[11px] font-medium uppercase tracking-wide">
                            Date
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {formatDate(timesheet.date)}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <FolderKanban size={13} />
                        <span className="text-[11px] font-medium uppercase tracking-wide">
                            Project
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {timesheet.project || "—"}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <Clock3 size={13} />
                        <span className="text-[11px] font-medium uppercase tracking-wide">
                            Hours
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {timesheet.totalHours ?? 0} hrs
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <TimerReset size={13} />
                        <span className="text-[11px] font-medium uppercase tracking-wide">
                            Overtime
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {timesheet.overtimeHours ?? 0} hrs
                    </p>
                </div>
            </button>

            {/* ACTIONS */}
            {status === "Pending" && (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">

                    <button
                        type="button"
                        onClick={() => onApprove?.(timesheet)}
                        className="cursor-pointer flex-1 h-10 rounded-2xl bg-green-600 hover:bg-green-700 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} />
                        Approve
                    </button>

                    <button
                        type="button"
                        onClick={() => onReject?.(timesheet)}
                        className="cursor-pointer flex-1 h-10 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <XCircle size={16} />
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};

export default TimesheetCard;