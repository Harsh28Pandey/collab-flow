// src/components/timesheet/TimesheetSkeleton.jsx
import React from "react";

const SkeletonCard = () => {
    return (
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 sm:p-5 animate-pulse shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

            {/* TOP ROW — avatar, name, status badge */}
            <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-11 w-11 rounded-2xl bg-zinc-900 border border-white/5 shrink-0" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-32 rounded-lg bg-zinc-900 border border-white/5" />
                        <div className="h-3 w-40 rounded-md bg-zinc-900/60" />
                    </div>
                </div>

                <div className="h-7 w-20 rounded-lg bg-zinc-900 border border-white/5 shrink-0" />
            </div>

            {/* DETAILS GRID — date / project / hours / overtime */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 space-y-2 shadow-inner">
                        <div className="h-2.5 w-12 rounded-md bg-zinc-800/80" />
                        <div className="h-3.5 w-16 rounded-md bg-zinc-800" />
                    </div>
                ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-4 pt-3 border-t border-white/5">
                <div className="flex-1 h-10 rounded-xl bg-zinc-900 border border-white/5" />
                <div className="flex-1 h-10 rounded-xl bg-zinc-900/60 border border-white/5" />
            </div>
        </div>
    );
};

const TimesheetSkeleton = () => {

    return (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
            ))}

        </div>

    );

};

export default TimesheetSkeleton;