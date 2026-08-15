import React from "react";

import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import ActionButtons from "./ActionButtons";

const TimesheetTable = ({
    data,
    onView,
    onApprove,
    onReject,
}) => {

    if (!data.length)
        return <EmptyState />;

    return (

        <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-[2rem] border border-white/10 bg-zinc-950/60 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] custom-scrollbar">

                <table className="w-full text-left border-collapse">

                    <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur-xl z-10 border-b border-white/10">

                        <tr>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Employee
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Department
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Date
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                In
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Out
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Break
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Hours
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Overtime
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Status
                            </th>

                            <th className="p-4 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-white/5">

                        {data.map((item) => (

                            <tr
                                key={item._id}
                                className="hover:bg-zinc-900/40 transition-all duration-200"
                            >

                                <td className="p-4">

                                    <div className="flex gap-3 items-center min-w-0">

                                        <img
                                            src={
                                                item.employee?.profileImageUrl ||
                                                "/default-avatar.png"
                                            }
                                            alt=""
                                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10 bg-zinc-900 shadow-inner"
                                        />

                                        <div className="min-w-0">

                                            <p className="text-sm font-mono font-bold text-white truncate tracking-wide">

                                                {item.employee?.name || "Unknown"}

                                            </p>

                                            <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">

                                                {item.employee?.email || ""}

                                            </p>

                                        </div>

                                    </div>

                                </td>

                                <td className="p-4 text-xs font-mono text-zinc-300">

                                    {item.employee?.department || "—"}

                                </td>

                                <td className="p-4 text-xs font-mono text-zinc-300">

                                    {new Date(item.date)
                                        .toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}

                                </td>

                                <td className="p-4 text-xs font-mono text-zinc-300">

                                    {item.clockIn || "—"}

                                </td>

                                <td className="p-4 text-xs font-mono text-zinc-300">

                                    {item.clockOut || "—"}

                                </td>

                                <td className="p-4 text-xs font-mono text-zinc-300">

                                    {item.breakMinutes ?? 0} min

                                </td>

                                <td className="p-4 text-xs font-mono font-bold text-cyan-400">

                                    {item.totalHours ?? 0} hrs

                                </td>

                                <td className="p-4 text-xs font-mono font-bold text-amber-400">

                                    {item.overtimeHours ?? 0} hrs

                                </td>

                                <td className="p-4">

                                    <StatusBadge
                                        status={item.status}
                                    />

                                </td>

                                <td className="p-4">

                                    <ActionButtons
                                        row={item}
                                        onView={onView}
                                        onApprove={onApprove}
                                        onReject={onReject}
                                    />

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Mobile Card Grid View */}
            <div className="grid gap-4 lg:hidden">

                {data.map((item) => (

                    <div
                        key={item._id}
                        className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                    >

                        <div className="flex gap-3 items-center">

                            <img
                                src={
                                    item.employee?.profileImageUrl ||
                                    "/default-avatar.png"
                                }
                                alt=""
                                className="w-12 h-12 rounded-2xl object-cover border border-white/10 bg-zinc-900 shadow-inner shrink-0"
                            />

                            <div className="min-w-0 flex-1">

                                <h3 className="text-sm font-mono font-bold text-white truncate tracking-wide">

                                    {item.employee?.name || "Unknown"}

                                </h3>

                                <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">

                                    {item.employee?.department || "General"}

                                </p>

                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5 text-xs font-mono">

                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Date</span>
                                <span className="text-zinc-200 font-bold">{new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>

                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">Total Hours</span>
                                <span className="text-cyan-400 font-bold">{item.totalHours ?? 0} hrs</span>
                            </div>

                            <div className="col-span-2 bg-zinc-900/50 border border-white/5 rounded-2xl p-3 shadow-inner flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Status</span>
                                <StatusBadge
                                    status={item.status}
                                />
                            </div>

                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">

                            <ActionButtons
                                row={item}
                                onView={onView}
                                onApprove={onApprove}
                                onReject={onReject}
                            />

                        </div>

                    </div>

                ))}

            </div>

            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
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
        </>
    );

};

export default TimesheetTable;