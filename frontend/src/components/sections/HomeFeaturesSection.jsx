import React from "react";
import { LuTerminal, LuCpu, LuGlobe, LuZap, LuShieldCheck, LuLayers } from "react-icons/lu";

const HomeFeaturesSection = () => {
    // Concise, Developer-Focused Features mapped to Terminal Snippets
    const features = [
        {
            title: "Real-time Sync Engine",
            desc: "Sub-millisecond state synchronization across your workspace with zero manual refreshing.",
            file: "sync.config.ts",
            command: "collab.sync({ speed: 'realtime' })",
            icon: <LuZap size={16} />,
            delay: "0s"
        },
        {
            title: "Smart Task Orchestration",
            desc: "Automated pipeline triggers and smart task routing based on actual team velocity.",
            file: "pipeline.json",
            command: "npx collab orchestrate --auto",
            icon: <LuCpu size={16} />,
            delay: "0.1s"
        },
        {
            title: "Central Command",
            desc: "A unified, terminal-driven interface for code, documents, tasks, and discussions.",
            file: "command.rs",
            command: "cargo run --bin workspace",
            icon: <LuTerminal size={16} />,
            delay: "0.2s"
        },
        {
            title: "Global Collaboration",
            desc: "Built for distributed teams. Work asynchronously without losing context or blocking progress.",
            file: "cluster.yaml",
            command: "collab cluster --region global",
            icon: <LuGlobe size={16} />,
            delay: "0.3s"
        },
        {
            title: "Enterprise Security",
            desc: "End-to-end encryption with granular role-based access control for total peace of mind.",
            file: "security.env",
            command: "AUTH_MODE=strict collab secure",
            icon: <LuShieldCheck size={16} />,
            delay: "0.4s"
        },
        {
            title: "Seamless Integrations",
            desc: "Connects instantly with GitHub, Slack, and your favorite modern developer toolchain.",
            file: "integrations.js",
            command: "import '@collab/toolkit'",
            icon: <LuLayers size={16} />,
            delay: "0.5s"
        }
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

                    {/* Minimalist Developer Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-4 cursor-default">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                            Platform Capabilities
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                        Powerful{" "}
                        <span className="relative inline-block px-1">
                            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 blur-[25px] opacity-30 rounded-full" />
                            <span className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Features
                            </span>
                        </span>
                    </h2>

                    <p className="max-w-xl mx-auto mt-4 text-sm md:text-base text-zinc-400 font-medium">
                        Everything you need to orchestrate complex workflows, align your engineering team, and ship code faster.
                    </p>
                </div>

                {/* Terminal Glassmorphic Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 text-left">
                    {features.map((item, i) => (
                        <div
                            key={i}
                            style={{ animationDelay: item.delay }}
                            className="group relative bg-zinc-950/80 backdrop-blur-2xl rounded-2xl
                            border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]
                            hover:border-cyan-500/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)]
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
                                <span className="text-[10.5px] font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors">
                                    {item.file}
                                </span>
                            </div>

                            {/* Inner Terminal Body */}
                            <div className="p-5 z-10">
                                <div className="relative z-10 flex flex-col gap-3">
                                    {/* Icon & Title */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors shadow-inner">
                                            {item.icon}
                                        </div>
                                        <h3 className="font-bold text-[15px] text-zinc-100 group-hover:text-white tracking-tight">
                                            {item.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className="text-zinc-500 text-[13px] leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">
                                        {item.desc}
                                    </p>

                                    {/* Terminal Command Line */}
                                    <div className="mt-1 pt-2.5 border-t border-white/5 flex items-center gap-2 font-mono text-[10.5px] text-zinc-400 bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-white/[0.02]">
                                        <span className="text-cyan-400 font-bold">&gt;</span>
                                        <span className="truncate text-zinc-300">{item.command}</span>
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

export default HomeFeaturesSection;