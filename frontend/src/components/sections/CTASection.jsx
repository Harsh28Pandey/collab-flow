import React from "react";
import { useNavigate } from "react-router-dom";
import { LuZap } from "react-icons/lu";

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 text-center bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col justify-center items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-60">
                <div className="h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>

            {/* Sophisticated Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

            {/* Main CTA Card (Compact Glass Dock) */}
            <div className="relative z-10 w-full max-w-4xl mx-auto">
                <div className="relative p-8 md:p-12 rounded-[2rem] bg-zinc-900/40 backdrop-blur-2xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-500 group">

                    {/* Inner Card Subtle Highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                    {/* Pill Badge */}
                    <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                            Get Started
                        </span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-[1.1] tracking-tight text-white">
                        Start Collaborating{" "}
                        <span className="relative inline-block px-2">
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[25px] opacity-30 rounded-full" />
                            <span className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Today
                            </span>
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="mb-8 text-sm md:text-base text-zinc-400 font-medium max-w-xl mx-auto tracking-wide">
                        Join modern engineering teams supercharging their workflows and shipping code faster.
                    </p>

                    {/* Tactile Button with Ambient Glow */}
                    <div className="relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition duration-500" />

                        <button
                            onClick={() => navigate("/login")}
                            className="cursor-pointer group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-zinc-950 text-white font-bold rounded-2xl 
                            border border-white/10 hover:border-white/20
                            active:scale-95 transition-all duration-300 ease-out overflow-hidden text-sm"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <span className="relative z-10 tracking-wide flex items-center gap-2">
                                Start Now
                                <LuZap className="text-blue-400 group-hover:text-white transition-colors" size={16} />
                            </span>

                            {/* Hover Arrow */}
                            <svg className="relative z-10 w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>

                    {/* Trust/Footer Text */}
                    <p className="mt-6 text-xs font-medium text-zinc-500 tracking-wide">
                        No credit card required <span className="mx-1.5 text-zinc-600">•</span> Free forever tier available
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CTASection;