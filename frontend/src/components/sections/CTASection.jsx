import React from "react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-24 md:py-32 px-4 md:px-6 text-center bg-[#fafaf9] text-slate-900 overflow-hidden flex flex-col justify-center items-center">

            {/* Subtle Architectural Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

            {/* Premium Top Divider (Connecting from previous sections) */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-200/60 to-transparent" />
            </div>

            {/* Sophisticated Ambient Glows (Behind the Glass Card) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-yellow-300/30 to-orange-400/20 blur-[120px] rounded-full animate-[breathe_8s_ease-in-out_infinite_alternate] pointer-events-none" />

            {/* Glassmorphic Floating Accents */}
            <div className="absolute top-1/4 left-[15%] w-24 h-24 bg-white/40 backdrop-blur-md rounded-full border border-white/80 shadow-[0_8px_32px_rgba(249,115,22,0.05),inset_0_2px_4px_rgba(255,255,255,1)] animate-[floatSlow_7s_ease-in-out_infinite] pointer-events-none" />
            <div className="absolute bottom-1/4 right-[15%] w-16 h-16 bg-gradient-to-br from-white/60 to-orange-50/30 backdrop-blur-lg rounded-2xl rotate-12 border border-white/90 shadow-[0_4px_20px_rgba(234,179,8,0.06),inset_0_1px_2px_rgba(255,255,255,1)] animate-[floatSlow_6s_ease-in-out_infinite_1s] pointer-events-none" />

            {/* Main CTA Card (Premium Frosted Glass) */}
            <div className="relative z-10 w-full max-w-5xl mx-auto">
                <div className="relative p-10 md:p-20 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500">

                    {/* Inner Card Subtle Highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />

                    {/* Pill Badge */}
                    <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-orange-50/80 border border-orange-200/60 shadow-[0_2px_10px_rgba(249,115,22,0.05)] animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
                        </span>
                        <span className="text-xs font-bold tracking-widest text-orange-600 uppercase">
                            Get Started
                        </span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight text-slate-900 animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                        Start Collaborating{" "}
                        <span className="relative inline-block px-2">
                            <span className="absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-40 rounded-full" />
                            <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                                Today
                            </span>
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="mb-10 text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto tracking-wide animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
                        Join modern teams who are already improving their workflow, shipping faster, and building the future together.
                    </p>

                    {/* Tactile Button */}
                    <div className="animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
                        <button
                            onClick={() => navigate("/login")}
                            className="group relative inline-flex cursor-pointer items-center justify-center gap-2 px-10 py-4 bg-gradient-to-b from-orange-400 to-orange-500 text-white font-bold rounded-full 
                            shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(249,115,22,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] 
                            hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_12px_28px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)] 
                            hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-300 ease-out overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                            <span className="relative z-10 text-[1.1rem] tracking-wide">Start Now</span>

                            {/* Refined Hover Arrow */}
                            <svg className="relative z-10 w-5 h-5 ml-1 transition-transform duration-300 cubic-bezier(0.16,1,0.3,1) group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>

                    {/* Trust/Footer Text */}
                    <p className="mt-8 text-sm font-medium text-slate-400 tracking-wide animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.4s_both]">
                        No credit card required <span className="mx-2 text-slate-300">•</span> Free forever plan available
                    </p>
                </div>
            </div>

            {/* Premium Developer Keyframes */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-24px); filter: blur(8px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); filter: blur(8px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translate(0, 0) rotate(var(--tw-rotate, 0deg)); }
                    33% { transform: translate(3px, -10px) rotate(calc(var(--tw-rotate, 0deg) + 2deg)); }
                    66% { transform: translate(-3px, 8px) rotate(calc(var(--tw-rotate, 0deg) - 2deg)); }
                }
                @keyframes breathe {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.05); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default CTASection;