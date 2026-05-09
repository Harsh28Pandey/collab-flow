import React from "react";
import { useNavigate } from "react-router-dom";

const HomeHeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 md:px-6 text-center bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white overflow-hidden">

            {/* Animated Glow Orbs */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-400 opacity-30 blur-[130px] rounded-full animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-sky-300 opacity-25 blur-[130px] rounded-full animate-pulse [animation-delay:1.5s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500 opacity-10 blur-[100px] rounded-full animate-pulse [animation-delay:0.8s]" />

            {/* Floating Particles */}
            <div className="absolute top-16 left-[15%] w-1.5 h-1.5 bg-white opacity-40 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="absolute top-24 right-[20%] w-1 h-1 bg-sky-200 opacity-50 rounded-full animate-bounce [animation-delay:0.6s]" />
            <div className="absolute bottom-16 left-[25%] w-1 h-1 bg-indigo-200 opacity-40 rounded-full animate-bounce [animation-delay:1s]" />
            <div className="absolute bottom-24 right-[15%] w-1.5 h-1.5 bg-white opacity-30 rounded-full animate-bounce [animation-delay:0.4s]" />
            <div className="absolute top-1/3 left-[6%] w-1 h-1 bg-sky-300 opacity-50 rounded-full animate-ping [animation-delay:1.2s]" />
            <div className="absolute top-2/3 right-[8%] w-1 h-1 bg-indigo-300 opacity-40 rounded-full animate-ping [animation-delay:0.9s]" />

            {/* Shimmer Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5 animate-spin [animation-duration:20s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 animate-spin [animation-duration:15s] [animation-direction:reverse]" />

            {/* Content */}
            <div className="relative z-10">
                <h1
                    className="text-3xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg
                    animate-[fadeInDown_0.8s_ease_both]"
                >
                    Collaborate Smarter <br />

                    <span className="bg-gradient-to-r from-white via-sky-100 to-indigo-100 bg-clip-text text-transparent">
                        Work Better Together
                    </span>
                </h1>

                <p
                    className="max-w-2xl mx-auto text-base md:text-lg opacity-90 leading-relaxed
                    animate-[fadeInUp_0.8s_ease_0.3s_both]"
                >
                    Manage tasks, communicate with your team, and keep everything organized —
                    all in one powerful workspace.
                </p>

                <div className="mt-8 flex justify-center gap-4 flex-wrap animate-[fadeInUp_0.8s_ease_0.5s_both]">
                    <button
                        onClick={() => navigate("/login")}
                        className="relative px-8 py-3 bg-white text-blue-600 font-semibold rounded-full
                        shadow-[0_4px_24px_rgba(255,255,255,0.3)]
                        hover:shadow-[0_6px_36px_rgba(255,255,255,0.5)]
                        hover:-translate-y-1 active:scale-95
                        transition-all duration-300 cursor-pointer
                        overflow-hidden group"
                    >

                        {/* Shimmer sweep on hover */}
                        <span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent
                            -translate-x-full group-hover:translate-x-full
                            transition-transform duration-700 ease-in-out opacity-60"
                        />

                        <span className="relative z-10">
                            Get Started
                        </span>
                    </button>
                </div>
            </div>

            {/* Keyframe styles */}
            <style>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-28px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(28px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
};

export default HomeHeroSection;