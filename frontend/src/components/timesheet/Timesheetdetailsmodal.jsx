// src/components/timesheet/Timesheetdetailsmodal.jsx
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

// Updated for Dark Mode Bento Glassmorphism
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
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const InfoBlock = ({ icon: Icon, label, value }) => (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-3.5 shadow-inner transition-all hover:bg-zinc-900/60">
        <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
            <Icon size={14} className="text-cyan-400" />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider">
                {label}
            </span>
        </div>

        <p className="text-xs sm:text-sm font-mono font-bold text-zinc-200 break-words">
            {value || "—"}
        </p>
    </div>
);

const Timesheetdetailsmodal = ({ open, timesheet, onClose }) => {

    if (!open || !timesheet) return null;

    const status = timesheet.status || "Pending";
    const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.Pending;
    const StatusIcon = statusConfig.icon;

    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">

            <div className="relative w-full max-w-2xl bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[1.75rem] sm:rounded-[2.25rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] animate-modalPop my-auto overflow-hidden flex flex-col max-h-[85vh]">

                {/* Top Ambient Cyber Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>

                {/* HEADER */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 shrink-0">

                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            <ClipboardCheck size={20} className="text-cyan-400 sm:w-[20px] sm:h-[20px]" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-mono font-black text-white truncate tracking-wide">
                                Timesheet Details
                            </h2>

                            <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-0.5 truncate">
                                {formatDate(timesheet.date)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 flex items-center justify-center shrink-0 shadow-inner"
                    >
                        <X size={16} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 custom-scrollbar">
                    <div className="space-y-4 sm:space-y-5">

                        {/* STATUS */}
                        <div className="flex items-center justify-between bg-zinc-900/30 border border-white/5 rounded-2xl p-3 sm:p-4 shadow-inner">
                            <span className="text-xs sm:text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Status
                            </span>

                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold border shadow-inner ${statusConfig.badge}`}
                            >
                                <StatusIcon size={13} className="stroke-[2.5]" />
                                {status}
                            </span>
                        </div>

                        {/* WORK DETAILS */}
                        <div className="bg-zinc-900/40 border border-white/5 rounded-[1.5rem] p-4 sm:p-5 shadow-inner">

                            <h3 className="text-sm font-mono font-black text-white mb-4 tracking-wide flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                                Work Details
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-3.5 shadow-inner">
                                        <div className="flex items-center gap-1.5 text-zinc-500 mb-2">
                                            <StickyNote size={14} className="text-purple-400" />
                                            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider">
                                                Notes
                                            </span>
                                        </div>

                                        <p className="text-xs sm:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                            {timesheet.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TASKS */}
                        <div className="bg-zinc-900/40 border border-white/5 rounded-[1.5rem] p-4 sm:p-5 shadow-inner">

                            <h3 className="text-sm font-mono font-black text-white mb-4 tracking-wide flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                                Daily Tasks
                            </h3>

                            {Array.isArray(timesheet.tasks) && timesheet.tasks.length > 0 ? (
                                <div className="space-y-2.5">
                                    {timesheet.tasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-3 bg-zinc-950/50 border border-white/5 rounded-2xl px-4 py-3 shadow-inner hover:border-white/10 transition-all"
                                        >
                                            <p className="text-xs sm:text-sm font-mono text-zinc-300 truncate">
                                                {task.title}
                                            </p>

                                            <span className="shrink-0 text-[10px] sm:text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                                                {task.duration ?? task.hours ?? 0} hrs
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm font-mono text-zinc-500 italic">No tasks logged.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-white/5 px-4 sm:px-6 py-4 flex justify-end shrink-0 bg-zinc-950/40">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer h-10 px-6 sm:px-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all text-white text-xs sm:text-sm font-mono font-bold shadow-inner"
                    >
                        Close
                    </button>
                </div>

            </div>

            {/* ANIMATIONS + SCROLLBAR */}
            <style>
                {`
                    @keyframes modalPop {
                        from { opacity: 0; transform: scale(0.96) translateY(10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .animate-modalPop { animation: modalPop .25s ease; }
                    .animate-fadeIn { animation: fadeIn .2s ease; }

                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 999px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
                    }
                `}
            </style>
        </div>
    );
};

export default Timesheetdetailsmodal;