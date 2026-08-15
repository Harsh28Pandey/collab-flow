import React from "react";
import {
    Eye,
    Check,
    X
} from "lucide-react";

const ActionButtons = ({
    row,
    onView,
    onApprove,
    onReject,
}) => {

    return (

        <div className="flex items-center gap-2">

            {/* View Button */}
            <button
                onClick={() => onView(row)}
                title="View Details"
                className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition-all shadow-inner active:scale-95"
            >
                <Eye size={15} className="stroke-[2.5]" />
            </button>

            {/* Approve Button */}
            <button
                onClick={() => onApprove(row)}
                title="Approve"
                className="cursor-pointer h-9 w-9 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all shadow-inner active:scale-95"
            >
                <Check size={15} className="stroke-[3]" />
            </button>

            {/* Reject Button */}
            <button
                onClick={() => onReject(row)}
                title="Reject"
                className="cursor-pointer h-9 w-9 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-all shadow-inner active:scale-95"
            >
                <X size={15} className="stroke-[3]" />
            </button>

        </div>

    );

};

export default ActionButtons;