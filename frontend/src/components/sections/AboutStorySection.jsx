import React from "react";
import { LuTerminal, LuCode } from "react-icons/lu";

const AboutStorySection = () => {
    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

            {/* Architectural Top Divider (Neon Glow) */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-70">
                <div className="h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-purple-600/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="relative z-10 max-w-4xl mx-auto text-center w-full">

                {/* Minimalist Developer Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-4 cursor-default animate-[fadeInDown_0.8s_ease-out_both]">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                        Our Genesis Story
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white tracking-tight animate-[fadeInDown_0.8s_ease-out_0.1s_both]">
                    How It All{" "}
                    <span className="relative inline-block px-1">
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[25px] opacity-30 rounded-full" />
                        <span className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Began
                        </span>
                    </span>
                </h2>

                {/* Clean Typography for Story Text */}
                <p className="max-w-2xl mx-auto text-base md:text-lg text-zinc-400 font-medium leading-relaxed tracking-wide animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                    Collab Flow started as a simple idea to solve everyday engineering friction — context switching, delayed approvals, and scattered chats. We engineered a platform where everything stays structured, lightning-fast, and effortlessly efficient.
                </p>

                {/* Developer / Creator Credit Box */}
                <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-[fadeInUp_0.8s_ease-out_0.25s_both]">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
                        <LuCode size={16} />
                    </div>
                    <div className="text-left font-mono text-xs">
                        <div className="text-zinc-500">Backend & UI Developer</div>
                        <div className="text-zinc-200 font-bold">Harsh Pandey</div>
                    </div>
                </div>

                {/* Sophisticated Decorative Divider */}
                <div className="mt-10 flex items-center justify-center gap-4 opacity-80 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                    <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-blue-500/80" />
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-5 h-5 bg-blue-500/30 rounded-full blur-md" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    </div>
                    <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-purple-500/80" />
                </div>

            </div>

            {/* Advanced Pro-Level Keyframes */}
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

export default AboutStorySection;