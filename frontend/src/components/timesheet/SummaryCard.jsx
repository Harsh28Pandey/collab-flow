import React from "react";

const SummaryCard = ({
    title,
    value,
    icon,
}) => {

    return (

        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center gap-3">

                <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">
                        {title}
                    </p>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-white mt-1.5 sm:mt-2 tracking-tight truncate">
                        {value}
                    </h2>
                </div>

                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner text-cyan-400">
                    {icon}
                </div>

            </div>

        </div>

    );

};

export default SummaryCard;