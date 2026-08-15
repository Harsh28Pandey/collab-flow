import React from "react";
import { LuServer } from "react-icons/lu";

const PlaygroundTopology = ({ nodeStatus, activeUsersCount }) => {
    return (
        <div className="w-full bg-zinc-950/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 md:p-8 text-left animate-[fadeIn_0.4s_ease-out]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <LuServer className="text-cyan-400" /> Active Workspace Node Topology
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">Cluster Region: <span className="text-green-400">ap-south-1 (Global Edge)</span></p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    <span className="text-zinc-300">Status: <strong className="text-cyan-300">{nodeStatus}</strong></span>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                        <span>NODE-01</span>
                        <span className="text-green-400">ONLINE</span>
                    </div>
                    <div className="text-sm font-bold text-white">Main Git Repo Branch</div>
                    <p className="text-[11px] text-zinc-400 mt-1">Auto-syncing PR #409</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                        <span>NODE-02</span>
                        <span className="text-green-400">ONLINE</span>
                    </div>
                    <div className="text-sm font-bold text-white">Active Team Members</div>
                    <p className="text-[11px] text-cyan-300 mt-1">{activeUsersCount} developers editing live</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                        <span>NODE-03</span>
                        <span className="text-green-400">ONLINE</span>
                    </div>
                    <div className="text-sm font-bold text-white">Pipeline Trigger</div>
                    <p className="text-[11px] text-purple-300 mt-1">Zero merge conflicts</p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 flex items-center justify-between">
                <span>💡 Tip: Switch back to CLI Console to test live state updates and watch this topology adapt in real-time.</span>
            </div>
        </div>
    );
};

export default PlaygroundTopology;