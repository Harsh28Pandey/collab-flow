import React from "react";
import { motion } from "framer-motion";
import { LuTerminal, LuGitBranch, LuCheck, LuArrowRight } from "react-icons/lu";

const flowSteps = [
    {
        file: "error_logs.log",
        title: "The Problem",
        badgeText: "Phase 01",
        badgeBg: "bg-red-500/10 text-red-400 border-red-500/20",
        command: "tail -f error.log",
        desc: "Team communication is scattered, repositories are out of sync, and tasks remain unorganized."
    },
    {
        file: "collab_engine.rs",
        title: "Collab Flow",
        badgeText: "Phase 02",
        badgeBg: "bg-blue-500/10 text-cyan-400 border-blue-500/20",
        command: "cargo run --release",
        desc: "A centralized, intelligent workspace integrating real-time execution and pipeline synchronization."
    },
    {
        file: "deploy_status.json",
        title: "The Result",
        badgeText: "Phase 03",
        badgeBg: "bg-green-500/10 text-green-400 border-green-500/20",
        command: "curl -I https://prod.ready",
        desc: "Unmatched velocity, crystal-clear team communication, and zero deployment friction."
    }
];

// Advanced Framer Motion Variants
const container = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 80, damping: 20, mass: 1 }
    }
};

const arrow = {
    hidden: { opacity: 0, scale: 0.5, x: -20 },
    visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const AnimatedFlow = () => {
    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

            {/* Architectural Top Divider (Neon Glow) */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-70">
                <div className="h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="relative z-10 max-w-6xl mx-auto text-center w-full">

                {/* Minimalist Developer Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-4 cursor-default animate-[fadeInDown_0.8s_ease-out_both]">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                        The Workflow Pipeline
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-white tracking-tight animate-[fadeInDown_0.8s_ease-out_0.1s_both]">
                    How Collab Flow{" "}
                    <span className="relative inline-block px-1">
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[25px] opacity-30 rounded-full" />
                        <span className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Solves Real Problems
                        </span>
                    </span>
                </h2>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6"
                >
                    {flowSteps.map((step, index) => (
                        <React.Fragment key={index}>
                            {/* TACTILE TERMINAL CARD */}
                            <motion.div
                                variants={item}
                                className="group relative bg-zinc-950/80 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-cyan-500/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full md:w-1/3 text-left overflow-hidden cursor-default"
                            >
                                {/* Terminal Top Bar (Mac Style) */}
                                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-red-500/80 transition-colors" />
                                        <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-yellow-500/80 transition-colors" />
                                        <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-green-500/80 transition-colors" />
                                    </div>
                                    <span className="text-[10.5px] font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors">
                                        {step.file}
                                    </span>
                                </div>

                                {/* Card Inner Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="p-5 md:p-6 relative z-10 flex flex-col items-start">
                                    <span className={`px-2.5 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider mb-4 ${step.badgeBg}`}>
                                        {step.badgeText}
                                    </span>

                                    <h3 className="font-bold text-lg mb-2 text-zinc-100 group-hover:text-white tracking-tight">
                                        {step.title}
                                    </h3>

                                    <p className="text-zinc-500 text-[13px] leading-relaxed font-medium group-hover:text-zinc-400 transition-colors mb-4">
                                        {step.desc}
                                    </p>

                                    {/* Terminal Command Line */}
                                    <div className="w-full pt-2.5 border-t border-white/5 flex items-center gap-2 font-mono text-[10.5px] text-zinc-400 bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-white/[0.02]">
                                        <span className="text-cyan-400 font-bold">&gt;</span>
                                        <span className="truncate text-zinc-300">{step.command}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* FLOW ARROW CONNECTOR */}
                            {index < flowSteps.length - 1 && (
                                <motion.div
                                    variants={arrow}
                                    className="flex items-center justify-center rotate-90 md:rotate-0 my-1 md:my-0 z-10"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 shadow-inner flex items-center justify-center text-cyan-400">
                                        <LuArrowRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

            </div>

            {/* Premium Developer Keyframes */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-15px); filter: blur(6px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
            `}</style>
        </section>
    );
};

export default AnimatedFlow;