import React from "react";
import { useNavigate } from "react-router-dom";
import { LuZap, LuTerminal, LuWorkflow, LuGitMerge, LuCheck } from "react-icons/lu";

const FeaturesHeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-6 text-center bg-zinc-950 text-zinc-100 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Top Divider (Neon Glow) */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-70">
                <div className="h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>

            {/* Architectural Ambient Orbs (Deep Dark Mode Neon) */}
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] rounded-full animate-[breathe_8s_ease-in-out_infinite_alternate] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/20 via-violet-600/10 to-transparent blur-[150px] rounded-full animate-[breathe_10s_ease-in-out_infinite_alternate-reverse] pointer-events-none" />

            {/* Floating Glassmorphic Chunks (Decorative Developer Nodes) */}
            {/* Left Node: Code Execution Sync */}
            <div className="hidden lg:flex absolute top-1/3 left-[4%] w-[280px] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-4 flex-col animate-[floatSlow_8s_ease-in-out_infinite] z-0 -rotate-2 hover:border-blue-500/30 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
                    <LuWorkflow className="text-blue-400" size={16} />
                    <span className="text-[11px] font-mono text-zinc-400 tracking-wider">features_sync.ts</span>
                </div>
                <div className="font-mono text-[11.5px] text-zinc-300 text-left leading-relaxed">
                    <span className="text-pink-400">import</span> {'{ '} <span className="text-cyan-300">loadFeatures</span> {' }'} <span className="text-pink-400">from</span> <span className="text-green-400">'@collab/core'</span>;<br />
                    <br />
                    <span className="text-blue-400">await</span> <span className="text-yellow-200">loadFeatures</span>({'{'}<br />
                    &nbsp;&nbsp;<span className="text-cyan-200">modules</span>: <span className="text-green-400">'all'</span>,<br />
                    &nbsp;&nbsp;<span className="text-cyan-200">status</span>: <span className="text-green-400">'active'</span><br />
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
                        <span className="text-sm font-bold text-zinc-100">Modules Live</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-500/20 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                                <LuCheck size={10} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium tracking-wide">100% synchronized</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Center Content */}
            <div className="relative z-10 flex flex-col items-center max-w-[1000px] mx-auto w-full">

                {/* Minimalist SaaS Badge */}
                <div className="mb-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] animate-[fadeInUp_0.8s_ease-out_both] cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
                        Feature Highlights
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h1 className="text-4xl sm:text-6xl lg:text-[4.8rem] font-extrabold mb-4 leading-[1.05] tracking-tight text-white animate-[fadeInUp_1s_ease-out_0.1s_both]">
                    Powerful Features of{" "}
                    <br className="hidden md:block" />
                    <span className="relative inline-block mt-2">
                        {/* Glow behind text */}
                        <span className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 blur-[40px] opacity-30 rounded-full" />
                        {/* Crisp Text Gradient */}
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500">
                            Collab Flow
                        </span>
                    </span>
                </h1>

                {/* Subheading */}
                <p className="max-w-2xl text-[15px] sm:text-[1.1rem] text-zinc-400 font-medium leading-relaxed mb-8 animate-[fadeInUp_1s_ease-out_0.2s_both] px-2">
                    Everything you need to manage teamwork, track progress, and collaborate effectively — all seamlessly integrated into one place.
                </p>

                {/* Unique Feature: Live CLI / Terminal Mockup UI Chunk */}
                <div className="w-full max-w-2xl mx-auto mb-8 bg-zinc-950/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-left overflow-hidden animate-[fadeInUp_1s_ease-out_0.25s_both]">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                            <LuTerminal size={12} className="text-cyan-400" />
                            <span>collab-features-cli.sh</span>
                        </div>
                    </div>
                    {/* Terminal Code Content */}
                    <div className="p-4 md:p-5 font-mono text-[12px] md:text-[13.5px] text-zinc-300 leading-relaxed">
                        <div className="text-zinc-500"># Initializing Collab Flow Modules...</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-cyan-400 font-bold">&gt;</span>
                            <span>collab-cli load --features --all</span>
                        </div>
                        <div className="mt-2 text-zinc-400 space-y-1">
                            <div className="flex items-center gap-2 text-green-400">
                                <span className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center"><LuCheck size={8} /></span>
                                <span>[OK] Real-time State Sync Engine initialized (<span className="text-yellow-200">&lt;1ms</span>)</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <span className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center"><LuCheck size={8} /></span>
                                <span>[OK] Smart Task Routing & Pipeline Triggers active</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <span className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center"><LuCheck size={8} /></span>
                                <span>[OK] Zero-Lag Workspace Command Center ready</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactile Button with Ambient Glow */}
                <div className="relative group cursor-pointer animate-[fadeInUp_1s_ease-out_0.3s_both]">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[1.25rem] blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />

                    <button
                        onClick={() => navigate("/login")}
                        className="cursor-pointer relative flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-950 text-white font-bold text-[15px] rounded-[1.25rem] border border-white/10 active:scale-95 transition-all duration-300 overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <span className="relative z-10 flex items-center gap-2">
                            Get Started
                            <LuZap className="text-blue-400 group-hover:text-white transition-colors" size={18} />
                        </span>

                        {/* Hover Arrow */}
                        <svg className="relative z-10 w-4 h-4 ml-1 text-white transition-transform duration-300 ease-out group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
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

export default FeaturesHeroSection;