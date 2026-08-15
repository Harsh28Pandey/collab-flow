import React, { useState, useEffect } from "react";
import { LuGauge, LuZap, LuActivity } from "react-icons/lu";

const PlaygroundMetrics = () => {
    const [cpuLoad, setCpuLoad] = useState(14.2);
    const [memoryUsage, setMemoryUsage] = useState(1.24);

    useEffect(() => {
        const timer = setInterval(() => {
            setCpuLoad((12 + Math.random() * 5).toFixed(1));
            setMemoryUsage((1.2 + Math.random() * 0.1).toFixed(2));
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full bg-zinc-950/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 md:p-8 text-left animate-[fadeIn_0.4s_ease-out]">
            <div className="pb-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LuGauge className="text-cyan-400" /> Real-Time Cluster Telemetry & Metrics
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">Live performance readings from global edge nodes.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 my-6">
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">CPU Edge Load</span>
                    <div className="text-2xl font-extrabold text-white mt-2 font-mono flex items-center gap-2">
                        {cpuLoad}% <LuActivity className="text-green-400 text-lg animate-pulse" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Optimal load threshold (&lt;40%)</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Memory Allocation</span>
                    <div className="text-2xl font-extrabold text-white mt-2 font-mono flex items-center gap-2">
                        {memoryUsage} GB <LuZap className="text-cyan-400 text-lg" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Shared workspace pool</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Sync State</span>
                    <div className="text-2xl font-extrabold text-green-400 mt-2 font-mono">
                        99.99%
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Zero packet loss</p>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundMetrics;