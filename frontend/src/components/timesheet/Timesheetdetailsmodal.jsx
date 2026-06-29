import React from "react";
import {
    X,
    Calendar,
    FolderKanban,
    ClipboardCheck,
    LogIn,
    LogOut,
    Coffee,
    TimerReset,
    StickyNote,
    Clock3,
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
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const InfoBlock = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-50 rounded-2xl p-3.5">
        <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
            <Icon size={14} />
            <span className="text-[11px] font-medium uppercase tracking-wide">
                {label}
            </span>
        </div>

        <p className="text-sm font-semibold text-gray-900 wrap-break-word">
            {value || "—"}
        </p>
    </div>
);

const TimesheetDetailsModal = ({ open, timesheet, onClose }) => {

    if (!open || !timesheet) return null;

    const status = timesheet.status || "Pending";
    const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.Pending;
    const StatusIcon = statusConfig.icon;

    return (
        <div className="fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">

            <div className="w-full max-w-2xl bg-white rounded-[26px] shadow-2xl overflow-hidden animate-[modalPop_.2s_ease] my-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                            <ClipboardCheck size={22} className="text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                Timesheet Details
                            </h2>

                            <p className="text-xs sm:text-sm text-gray-500">
                                {formatDate(timesheet.date)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer h-10 w-10 rounded-2xl hover:bg-gray-100 transition flex items-center justify-center"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">

                    {/* STATUS */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            Status
                        </span>

                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.badge}`}
                        >
                            <StatusIcon size={13} />
                            {status}
                        </span>
                    </div>

                    {/* WORK DETAILS */}
                    <div className="border border-gray-200 rounded-3xl p-4">

                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            Work Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <InfoBlock icon={Calendar} label="Date" value={formatDate(timesheet.date)} />
                            <InfoBlock icon={FolderKanban} label="Project" value={timesheet.project} />
                            <InfoBlock icon={ClipboardCheck} label="Attendance" value={timesheet.attendanceStatus} />
                            <InfoBlock icon={FolderKanban} label="Work Mode" value={timesheet.workMode} />
                            <InfoBlock icon={LogIn} label="Clock In" value={timesheet.clockIn} />
                            <InfoBlock icon={LogOut} label="Clock Out" value={timesheet.clockOut} />
                            <InfoBlock icon={Coffee} label="Break" value={`${timesheet.breakMinutes ?? 0} min`} />
                            <InfoBlock icon={Clock3} label="Total Hours" value={`${timesheet.totalHours ?? 0} hrs`} />
                            <InfoBlock icon={TimerReset} label="Overtime" value={`${timesheet.overtimeHours ?? 0} hrs`} />
                        </div>

                        {timesheet.notes && (
                            <div className="mt-3">
                                <div className="bg-gray-50 rounded-2xl p-3.5">
                                    <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                                        <StickyNote size={14} />
                                        <span className="text-[11px] font-medium uppercase tracking-wide">
                                            Notes
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {timesheet.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TASKS */}
                    <div className="border border-gray-200 rounded-3xl p-4">

                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ClipboardCheck size={18} />
                            Daily Tasks
                        </h3>

                        {Array.isArray(timesheet.tasks) && timesheet.tasks.length > 0 ? (
                            <div className="space-y-2.5">
                                {timesheet.tasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                                    >
                                        <p className="text-sm text-gray-900 truncate">
                                            {task.title}
                                        </p>

                                        <span className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                            {task.duration ?? task.hours ?? 0} hrs
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No tasks logged.</p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-gray-100 px-5 py-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all text-white text-sm font-semibold"
                    >
                        Close
                    </button>
                </div>

                <style>
                    {`
                        @keyframes modalPop {
                            from { opacity: 0; transform: scale(0.96); }
                            to { opacity: 1; transform: scale(1); }
                        }

                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }

                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 999px;
                        }

                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

export default TimesheetDetailsModal;