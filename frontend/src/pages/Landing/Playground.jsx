import React, { useState, useEffect } from "react";

import { LuTerminal, LuActivity, LuWorkflow, LuGauge, LuCpu, LuShield, LuZap } from "react-icons/lu";
import Navbar from "./Navbar";
import PlaygroundTerminal from "../../components/sections/PlaygroundTerminal";
import PlaygroundTopology from "../../components/sections/PlaygroundTopology";
import PlaygroundMetrics from "../../components/sections/PlaygroundMetrics";
import PlaygroundWorkflowBuilder from "../../components/sections/PlaygroundWorkflowBuilder";

const Playground = () => {
    const [activeTab, setActiveTab] = useState("console"); // console, simulator, workflow, metrics
    const [nodeStatus, setNodeStatus] = useState("Synchronized");
    const [activeUsersCount, setActiveUsersCount] = useState(4);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsersCount(prev => Math.floor(Math.random() * 3) + 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleCommandExecute = (cmd) => {
        if (cmd.includes("sync")) setNodeStatus("Fully Synced");
        else if (cmd.includes("orchestrate")) setNodeStatus("Pipeline Running");
        else if (cmd.includes("secure")) setNodeStatus("Secured");
        else setNodeStatus("Active");
    };

    return (
        <div className="bg-zinc-950 text-zinc-100 selection:bg-cyan-500 selection:text-white overflow-x-hidden font-sans min-h-screen flex flex-col">
            {/* Global Sticky Glass Navbar */}
            <Navbar />

            <main className="relative flex-grow pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-6 flex flex-col items-center">

                {/* Premium Developer Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

                {/* Architectural Top Divider */}
                <div className="absolute top-0 left-0 right-0 flex justify-center opacity-70">
                    <div className="h-[1px] w-full max-w-5xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                </div>

                {/* Ambient Lighting Orbs */}
                <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/15 via-violet-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">

                    {/* Badge */}
                    <div className="mb-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-80"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-cyan-400 to-blue-500"></span>
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
                            Interactive Sandbox Environment
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-white text-center">
                        Collab Flow{" "}
                        <span className="relative inline-block px-1">
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[25px] opacity-30 rounded-full" />
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500">
                                Playground
                            </span>
                        </span>
                    </h1>

                    <p className="max-w-xl text-sm sm:text-base text-zinc-400 font-medium text-center mb-8">
                        Test live synchronization commands, inspect multi-user node clusters, build automated workflows, and monitor telemetry.
                    </p>

                    {/* Playground Navigation Sub-Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-inner">
                        <button
                            onClick={() => setActiveTab("console")}
                            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${activeTab === "console" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "text-zinc-400 hover:text-white"}`}
                        >
                            <LuTerminal size={14} /> CLI Console
                        </button>
                        <button
                            onClick={() => setActiveTab("simulator")}
                            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${activeTab === "simulator" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "text-zinc-400 hover:text-white"}`}
                        >
                            <LuActivity size={14} /> Node Topology
                        </button>
                        <button
                            onClick={() => setActiveTab("workflow")}
                            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${activeTab === "workflow" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "text-zinc-400 hover:text-white"}`}
                        >
                            <LuWorkflow size={14} /> Workflow Builder
                        </button>
                        <button
                            onClick={() => setActiveTab("metrics")}
                            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${activeTab === "metrics" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "text-zinc-400 hover:text-white"}`}
                        >
                            <LuGauge size={14} /> Telemetry
                        </button>
                    </div>

                    {/* DYNAMIC TAB RENDERING */}
                    {activeTab === "console" && <PlaygroundTerminal onCommandExecute={handleCommandExecute} />}
                    {activeTab === "simulator" && <PlaygroundTopology nodeStatus={nodeStatus} activeUsersCount={activeUsersCount} />}
                    {activeTab === "workflow" && <PlaygroundWorkflowBuilder />}
                    {activeTab === "metrics" && <PlaygroundMetrics />}

                    {/* Feature Highlights beneath console */}
                    <div className="grid sm:grid-cols-3 gap-4 w-full mt-8">
                        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"><LuZap size={16} /></div>
                            <div className="text-left"><h4 className="text-xs font-bold text-zinc-200">Sub-ms Latency</h4><p className="text-[11px] text-zinc-500">Real-time state execution</p></div>
                        </div>
                        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><LuCpu size={16} /></div>
                            <div className="text-left"><h4 className="text-xs font-bold text-zinc-200">Auto Orchestration</h4><p className="text-[11px] text-zinc-500">Smart task routing engine</p></div>
                        </div>
                        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400"><LuShield size={16} /></div>
                            <div className="text-left"><h4 className="text-xs font-bold text-zinc-200">Strict Auth</h4><p className="text-[11px] text-zinc-500">Granular role-based security</p></div>
                        </div>
                    </div>

                </div>
            </main>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Playground;