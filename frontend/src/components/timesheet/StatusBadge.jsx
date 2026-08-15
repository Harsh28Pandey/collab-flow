import React from "react";

const colors = {
    Pending:
        "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",

    Approved:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",

    Rejected:
        "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
};

const StatusBadge = ({ status }) => {

    return (

        <span
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${colors[status] || "bg-zinc-800 text-zinc-400 border border-white/5"}`}
        >
            {status}
        </span>

    );

};

export default StatusBadge;