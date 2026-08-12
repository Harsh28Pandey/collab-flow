import React from "react";
import { useNavigate } from "react-router-dom";

const FeaturesHeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 md:pt-44 pb-24 md:pb-32 px-4 md:px-6 text-center bg-[#fafaf9] text-slate-900 overflow-hidden min-h-[90vh] flex flex-col justify-center">

            {/* Premium Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Architectural Glowing Divider (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />
                <div className="absolute w-2/5 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            </div>

            {/* Refined Ethereal Lighting (Ambient Glows) */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-yellow-300/20 to-orange-200/10 blur-[130px] rounded-full animate-[breathe_8s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[500px] bg-gradient-to-tl from-orange-400/15 to-yellow-200/10 blur-[140px] rounded-full animate-[breathe_10s_ease-in-out_infinite_alternate-reverse] pointer-events-none mix-blend-multiply" />

            {/* Tactile Glassmorphic Elements (Floating Accents) */}
            <div className="absolute top-32 left-[12%] w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl rotate-12 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] animate-[floatSlow_7s_ease-in-out_infinite] pointer-events-none flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-300 opacity-20" />
            </div>

            <div className="absolute bottom-40 right-[15%] w-20 h-20 bg-gradient-to-tr from-white/60 to-white/20 backdrop-blur-lg rounded-full border border-white/80 shadow-[0_4px_24px_rgba(249,115,22,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] animate-[floatSlow_9s_ease-in-out_infinite_1s] pointer-events-none" />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Minimalist SaaS Badge */}
                <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both] hover:scale-105 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] transition-all duration-300 cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                        Feature Highlights
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold mb-6 leading-[1.05] tracking-tight text-slate-900 animate-[fadeInDown_1s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    Powerful Features of{" "}
                    <br className="hidden md:block" />
                    <span className="relative inline-block px-2 mt-2 md:mt-0">
                        {/* Soft glow behind text */}
                        <span className="absolute inset-0 bg-gradient-to-r from-orange-300 to-yellow-200 blur-2xl opacity-30 rounded-full" />

                        {/* Crisp Text Gradient */}
                        <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                            Collab Flow
                        </span>
                    </span>
                </h1>

                {/* Clean, Readable Typography for Subheading */}
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed tracking-wide animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
                    Everything you need to manage teamwork, track progress, and collaborate effectively — all seamlessly integrated into one place.
                </p>

                {/* Tactile, Professional CTA Button */}
                <div className="mt-12 flex justify-center animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
                    <button
                        onClick={() => navigate("/login")}
                        className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-b from-orange-400 to-orange-500 text-white font-semibold rounded-full 
                        shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(249,115,22,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] 
                        hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_12px_28px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)] 
                        hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-300 ease-out overflow-hidden cursor-pointer"
                    >
                        {/* Shimmer sweep */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                        <span className="relative z-10 text-[1.05rem] tracking-wide">Get Started</span>

                        {/* Elegant Arrow Indicator */}
                        <svg className="relative z-10 w-4 h-4 ml-1 transition-transform duration-300 cubic-bezier(0.16,1,0.3,1) group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>

            </div>

            {/* Advanced Pro-Level Keyframes */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-30px); filter: blur(12px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); filter: blur(12px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translate(0, 0) rotate(var(--tw-rotate, 0deg)); }
                    33% { transform: translate(4px, -12px) rotate(calc(var(--tw-rotate, 0deg) + 2deg)); }
                    66% { transform: translate(-4px, 8px) rotate(calc(var(--tw-rotate, 0deg) - 2deg)); }
                }
                @keyframes breathe {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.05); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default FeaturesHeroSection;