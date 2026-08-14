import React from "react";
import { LuZap, LuGitPullRequest, LuLayoutDashboard, LuShieldAlert, LuClock, LuFolderSearch } from "react-icons/lu";

const HomeProblemsSection = () => {
    // Concise, Non-Repetitive Developer Pain Points mapped to "Terminal Errors"
    const problems = [
        {
            file: "context_switch.ts",
            icon: <LuGitPullRequest size={16} />,
            errorType: "Traceback",
            title: "Context Switching",
            desc: "Jumping between 5 different tools just to merge a single feature.",
            delay: "0s"
        },
        {
            file: "sync_manager.js",
            icon: <LuClock size={16} />,
            errorType: "Timeout",
            title: "Async Delays",
            desc: "Waiting hours for code reviews and task approvals across timezones.",
            delay: "0.1s"
        },
        {
            file: "asset_loader.py",
            icon: <LuFolderSearch size={16} />,
            errorType: "404 Not Found",
            title: "Scattered Resources",
            desc: "Losing crucial docs, assets, and repo links in endless chat threads.",
            delay: "0.2s"
        },
        {
            file: "sprint_tracker.go",
            icon: <LuLayoutDashboard size={16} />,
            errorType: "Visibility Null",
            title: "Blind Spots",
            desc: "Zero visibility into team bandwidth or actual sprint progress.",
            delay: "0.3s"
        },
        {
            file: "auth_guard.rs",
            icon: <LuShieldAlert size={16} />,
            errorType: "Access Denied",
            title: "Access Chaos",
            desc: "Managing permissions manually for every new hire or contractor.",
            delay: "0.4s"
        },
        {
            file: "engine_core.cpp",
            icon: <LuZap size={16} />,
            errorType: "Memory Leak",
            title: "Slow Execution",
            desc: "Heavy, bloated software that freezes when you need it most.",
            delay: "0.5s"
        },
    ];

    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

            {/* Architectural Top Divider (Neon Glow) */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-70">
                <div className="h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/10 to-indigo-600/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="relative z-10 max-w-6xl mx-auto w-full">

                {/* Section Heading */}
                <div className="text-center mb-12 md:mb-16 animate-[fadeInDown_0.8s_ease-out_both]">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 backdrop-blur-md mb-4 cursor-default">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
                            Legacy Blockers
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                        Problems{" "}
                        <span className="relative inline-block px-1">
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[25px] opacity-30 rounded-full" />
                            <span className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                We Solve
                            </span>
                        </span>
                    </h2>

                    <p className="max-w-xl mx-auto mt-4 text-sm md:text-base text-zinc-400 font-medium">
                        Friction kills velocity. We've engineered Collab Flow to permanently eliminate these legacy workflow issues.
                    </p>
                </div>

                {/* Terminal Glassmorphic Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 text-left">
                    {problems.map((item, i) => (
                        <div
                            key={i}
                            style={{ animationDelay: item.delay }}
                            className="group relative bg-zinc-950/80 backdrop-blur-2xl rounded-2xl
                            border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]
                            hover:border-blue-500/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)]
                            hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden
                            animate-[fadeInUp_0.8s_ease-out_both]"
                        >
                            {/* Terminal Top Bar (Mac Style) */}
                            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-red-500/80 transition-colors" />
                                    <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-yellow-500/80 transition-colors" />
                                    <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-green-500/80 transition-colors" />
                                </div>
                                <span className="text-[10.5px] font-mono text-zinc-500 group-hover:text-blue-400 transition-colors">
                                    {item.file}
                                </span>
                            </div>

                            {/* Inner Terminal Body */}
                            <div className="p-5 z-10 h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="flex items-start gap-3.5 relative z-10">
                                    {/* Console Error Indicator */}
                                    <div className="mt-0.5 flex-shrink-0 text-red-400 group-hover:text-red-300 transition-colors">
                                        <span className="font-mono text-xs font-bold">&gt;_</span>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[9.5px] uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                                {item.errorType}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-[15px] text-zinc-100 group-hover:text-white tracking-tight mt-0.5">
                                            {item.title}
                                        </h3>

                                        <p className="text-zinc-500 text-[13px] leading-relaxed font-mono group-hover:text-zinc-400 transition-colors mt-1">
                                            <span className="text-pink-400/80">Error: </span>{item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Premium Developer Keyframes */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-15px); filter: blur(6px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); filter: blur(6px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
            `}</style>
        </section>
    );
};

export default HomeProblemsSection;