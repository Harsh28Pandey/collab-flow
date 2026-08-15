import React from "react";
import { FileX2 } from "lucide-react";

const EmptyState = () => {
    return (
        <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">

            {/* Glowing Icon Container */}
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                <FileX2
                    size={36}
                    className="text-cyan-400"
                />
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                No Timesheets Found
            </h3>

            <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                Try another search or create a new timesheet.
            </p>

        </div>
    );
};

export default EmptyState;