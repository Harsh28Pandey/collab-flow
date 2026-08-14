import React from "react";
import { useNavigate } from "react-router-dom";
import { LuTerminal, LuWorkflow, LuZap, LuGitMerge, LuCheck } from "react-icons/lu";

const HomeHeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-6 text-center bg-zinc-950 text-zinc-100 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Ambient Orbs (Deep Dark Mode Neon) */}
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] rounded-full animate-[breathe_8s_ease-in-out_infinite_alternate] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/20 via-violet-600/10 to-transparent blur-[150px] rounded-full animate-[breathe_10s_ease-in-out_infinite_alternate-reverse] pointer-events-none" />

            {/* Floating Glassmorphic Chunks (Decorative Developer Nodes) */}

            {/* Left Node: Code Execution Sync */}
            <div className="hidden lg:flex absolute top-1/3 left-[4%] w-[280px] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-4 flex-col animate-[floatSlow_8s_ease-in-out_infinite] z-0 -rotate-2 hover:border-blue-500/30 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
                    <LuWorkflow className="text-blue-400" size={16} />
                    <span className="text-[11px] font-mono text-zinc-400 tracking-wider">sync_engine.ts</span>
                </div>
                {/* Advanced IDE Syntax Highlighting */}
                <div className="font-mono text-[11.5px] text-zinc-300 text-left leading-relaxed">
                    <span className="text-pink-400">import</span> {'{ '} <span className="text-cyan-300">initSync</span> {' }'} <span className="text-pink-400">from</span> <span className="text-green-400">'@collab/core'</span>;<br />
                    <br />
                    <span className="text-blue-400">await</span> <span className="text-yellow-200">initSync</span>({'{'}<br />
                    &nbsp;&nbsp;<span className="text-cyan-200">team</span>: <span className="text-green-400">'engineering'</span>,<br />
                    &nbsp;&nbsp;<span className="text-cyan-200">latency</span>: <span className="text-green-400">'&lt;10ms'</span><br />
                    {'}'});
                </div>
            </div>

            {/* Right Node: Pipeline Status */}
            <div className="hidden lg:flex absolute bottom-1/3 right-[4%] w-[240px] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-4 flex-col animate-[floatSlow_9s_ease-in-out_infinite_1s] z-0 rotate-2 hover:border-purple-500/30 transition-colors cursor-default">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <LuGitMerge className="text-purple-400" size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-zinc-100">Live Pipeline</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-500/20 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                                <LuCheck size={10} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium tracking-wide">0 merge conflicts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Center Content */}
            <div className="relative z-10 flex flex-col items-center max-w-[900px] mx-auto w-full">

                {/* Glowing SaaS Badge */}
                <div className="mb-6 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] animate-[fadeInUp_0.8s_ease-out_both] cursor-pointer hover:bg-blue-500/20 hover:border-blue-400/40 hover:scale-105 transition-all duration-300">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-blue-300 uppercase">
                        Collab Flow Engine 2.0
                    </span>
                </div>

                {/* Centered Developer Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-[5.2rem] font-extrabold mb-5 leading-[1.05] tracking-tight text-white animate-[fadeInUp_1s_ease-out_0.1s_both]">
                    Unify Your Workflow. <br className="hidden md:block" />
                    <span className="relative inline-block mt-2">
                        <span className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 blur-[40px] opacity-30 rounded-full" />
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500">
                            Build Without Friction.
                        </span>
                    </span>
                </h1>

                {/* Concise Subheading */}
                <p className="max-w-2xl text-[15px] sm:text-[1.1rem] text-zinc-400 font-medium leading-relaxed mb-8 animate-[fadeInUp_1s_ease-out_0.2s_both] px-2">
                    A high-performance workspace engineered for modern teams. Sync tasks, execute logic, and manage projects in real-time with zero lag.
                </p>

                {/* Centered CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 animate-[fadeInUp_1s_ease-out_0.3s_both] w-full sm:w-auto px-4">

                    {/* Primary Button */}
                    <div className="relative group cursor-pointer w-full sm:w-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[1.25rem] blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
                        <button
                            onClick={() => navigate("/signup")}
                            className="cursor-pointer relative w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-950 text-white font-bold text-[15px] rounded-[1.25rem] border border-white/10 active:scale-95 transition-all duration-300 overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center gap-2">
                                Start Building
                                <LuZap className="text-blue-400 group-hover:text-white transition-colors" size={18} />
                            </span>
                        </button>
                    </div>

                    {/* Secondary Button */}
                    <button
                        onClick={() => navigate("/features")}
                        className="cursor-pointer group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900/40 border border-white/5 text-zinc-300 font-bold text-[15px] rounded-[1.25rem] 
                        backdrop-blur-xl hover:bg-zinc-800/80 hover:text-white hover:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]
                        active:scale-95 transition-all duration-300"
                    >
                        <LuTerminal size={18} className="text-zinc-500 group-hover:text-purple-400 transition-colors" />
                        Explore Features
                    </button>

                </div>

                {/* Developer Status Indicator (Mobile Responsive Fixed) */}
                <div className="mt-10 sm:mt-12 flex flex-wrap justify-center items-center gap-2 sm:gap-3 px-5 py-2 rounded-2xl sm:rounded-full bg-zinc-900/40 border border-white/5 backdrop-blur-md animate-[fadeInUp_1s_ease-out_0.4s_both] max-w-[95%] sm:max-w-full">
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[11px] sm:text-[12.5px] font-mono text-zinc-400 tracking-wide text-center">
                        System Status: <span className="text-zinc-200">Optimal</span> <span className="hidden sm:inline">&nbsp;•&nbsp;</span><span className="sm:hidden">|</span> Latency <span className="text-green-400">&lt;10ms</span>
                    </span>
                </div>

            </div>

            {/* Advanced Pro-Level Keyframes */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0) rotate(var(--tw-rotate, 0deg)); }
                    50% { transform: translateY(-15px) rotate(var(--tw-rotate, 0deg)); }
                }
                @keyframes breathe {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.15); opacity: 0.3; }
                }
            `}</style>
        </section>
    );
};

export default HomeHeroSection;