// CTASection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-20 md:py-28 text-center bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white overflow-hidden">

            {/* Animated background orbs */}
            <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-indigo-400 opacity-25 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-sky-300 opacity-20 blur-[120px] rounded-full animate-pulse [animation-delay:1.5s] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-blue-500 opacity-10 blur-[80px] rounded-full animate-pulse [animation-delay:0.8s] pointer-events-none" />

            {/* Spinning rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 animate-spin [animation-duration:22s] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5 animate-spin [animation-duration:16s] [animation-direction:reverse] pointer-events-none" />

            {/* Floating particles */}
            <div className="absolute top-10 left-[12%] w-1.5 h-1.5 bg-white opacity-40 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="absolute top-16 right-[18%] w-1 h-1 bg-sky-200 opacity-50 rounded-full animate-bounce [animation-delay:0.6s]" />
            <div className="absolute bottom-10 left-[22%] w-1 h-1 bg-indigo-200 opacity-40 rounded-full animate-bounce [animation-delay:1s]" />
            <div className="absolute bottom-16 right-[14%] w-1.5 h-1.5 bg-white opacity-30 rounded-full animate-bounce [animation-delay:0.4s]" />
            <div className="absolute top-1/3 left-[5%] w-1 h-1 bg-sky-300 opacity-50 rounded-full animate-ping [animation-delay:1.2s]" />
            <div className="absolute bottom-1/3 right-[6%] w-1 h-1 bg-indigo-300 opacity-40 rounded-full animate-ping [animation-delay:0.9s]" />

            {/* Content */}
            <div className="relative z-10 px-4 md:px-6">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm animate-[fadeInDown_0.7s_ease_both]">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-sky-100">
                        Get Started
                    </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg animate-[fadeInDown_0.7s_ease_0.1s_both]">
                    Start Collaborating{" "}
                    <span className="bg-gradient-to-r from-white via-sky-100 to-indigo-100 bg-clip-text text-transparent">
                        Today
                    </span>
                </h2>

                <p className="mb-8 md:mb-10 text-base md:text-lg text-white/80 animate-[fadeInUp_0.7s_ease_0.2s_both]">
                    Join teams who are already improving their workflow.
                </p>

                <div className="animate-[fadeInUp_0.7s_ease_0.35s_both]">
                    <button
                        onClick={() => navigate("/login")}
                        className="group relative px-8 md:px-10 py-3.5 bg-white text-blue-600 rounded-full font-semibold
                                   shadow-[0_4px_24px_rgba(255,255,255,0.3)]
                                   hover:shadow-[0_6px_40px_rgba(255,255,255,0.5)]
                                   hover:-translate-y-1 active:scale-95
                                   transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent
                                         -translate-x-full group-hover:translate-x-full
                                         transition-transform duration-700 ease-in-out opacity-60" />
                        <span className="relative z-10">Start Free</span>
                    </button>
                </div>

                <p className="mt-6 text-xs text-white/30 tracking-wide animate-[fadeInUp_0.7s_ease_0.45s_both]">
                    No credit card required · Free forever plan available
                </p>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
};

export default CTASection;