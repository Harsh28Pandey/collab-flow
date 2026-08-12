import React from "react";
import { motion } from "framer-motion";

const flowSteps = [
    {
        title: "The Problem",
        gradient: "from-slate-300 to-slate-200",
        badgeText: "Before",
        badgeBg: "bg-slate-100 text-slate-500",
        desc: "Team communication is scattered, files are lost, and tasks remain unorganized."
    },
    {
        title: "Collab Flow",
        gradient: "from-orange-400 via-orange-500 to-yellow-500",
        badgeText: "The Solution",
        badgeBg: "bg-orange-100 text-orange-600",
        desc: "A centralized, intelligent workspace with structured collaboration and seamless task management."
    },
    {
        title: "The Result",
        gradient: "from-yellow-400 to-orange-400",
        badgeText: "After",
        badgeBg: "bg-yellow-100 text-yellow-700",
        desc: "Unmatched productivity, crystal-clear communication, and an incredibly efficient workflow."
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
        <section className="relative py-24 md:py-32 px-4 md:px-6 bg-[#fafaf9] overflow-hidden flex flex-col items-center">

            {/* Premium Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-1/4 left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-yellow-100/50 to-orange-50/10 blur-[130px] rounded-full animate-[breathe_12s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[500px] bg-gradient-to-tl from-orange-100/40 to-yellow-50/20 blur-[140px] rounded-full animate-[breathe_9s_ease-in-out_infinite_alternate-reverse] pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 max-w-6xl mx-auto text-center w-full">

                {/* Minimalist SaaS Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] cursor-default animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                        The Workflow
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-16 text-slate-900 leading-[1.1] tracking-tight animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    How Collab Flow{" "}
                    <span className="relative inline-block px-2">
                        <span className="absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-40 rounded-full" />
                        <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
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
                            {/* TACTILE CARD */}
                            <motion.div
                                variants={item}
                                className="group relative bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.08),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full md:w-1/3 text-left overflow-hidden cursor-default"
                            >
                                {/* Card Inner Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-yellow-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                {/* Top Gradient Accent Line */}
                                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${step.gradient} opacity-80`} />

                                <div className="relative z-10 flex flex-col items-start">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 ${step.badgeBg}`}>
                                        {step.badgeText}
                                    </span>

                                    <h3 className="font-extrabold text-2xl mb-3 text-slate-800 tracking-tight">
                                        {step.title}
                                    </h3>

                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>

                            {/* PREMIUM SVG ARROW */}
                            {index < flowSteps.length - 1 && (
                                <motion.div
                                    variants={arrow}
                                    className="flex items-center justify-center rotate-90 md:rotate-0 my-2 md:my-0 z-10"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)] flex items-center justify-center text-orange-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
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
                    from { opacity: 0; transform: translateY(-24px); filter: blur(8px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes breathe {
                    0% { transform: scale(1) translateY(0); opacity: 0.8; }
                    100% { transform: scale(1.05) translateY(-15px); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default AnimatedFlow;