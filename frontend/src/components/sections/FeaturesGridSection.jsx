import React from "react";

const FeaturesGridSection = () => {
    return (
        <section className="relative py-24 md:py-32 px-4 md:px-6 bg-[#fafaf9] overflow-hidden flex flex-col items-center">

            {/* Premium Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-yellow-100/50 to-orange-50/10 blur-[130px] rounded-full animate-[breathe_12s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[500px] bg-gradient-to-tl from-orange-100/40 to-yellow-50/20 blur-[130px] rounded-full animate-[breathe_9s_ease-in-out_infinite_alternate-reverse] pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 max-w-6xl mx-auto w-full">

                {/* Section Heading */}
                <div className="text-center mb-16 md:mb-24 animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">

                    {/* Minimalist SaaS Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                            Core Features
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                        Built to{" "}
                        <span className="relative inline-block px-2">
                            <span className="absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-40 rounded-full" />
                            <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                                Simplify Teamwork
                            </span>
                        </span>
                    </h2>

                    <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-slate-500 font-medium leading-relaxed tracking-wide">
                        Built to streamline your workflow, boost productivity, and bring your entire team together in one unified workspace.
                    </p>
                </div>

                {/* Tactile Cards Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-left">
                    {[
                        { title: "Real-Time Collaboration", delay: "0s" },
                        { title: "Task Management", delay: "0.1s" },
                        { title: "Central Workspace", delay: "0.2s" },
                        { title: "Progress Tracking", delay: "0.3s" },
                        { title: "Team Communication", delay: "0.4s" },
                        { title: "Clean UI Experience", delay: "0.5s" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            style={{ animationDelay: item.delay }}
                            className="group relative bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2rem]
                            border border-white shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,1)]
                            hover:shadow-[0_20px_40px_rgba(249,115,22,0.08),inset_0_1px_1px_rgba(255,255,255,1)]
                            hover:-translate-y-1.5
                            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden
                            animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]"
                        >
                            {/* Inner Soft Glow on Hover (Warm Sunset Vibe) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-yellow-50/40
                            opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            {/* Sophisticated Bottom Glow Indicator */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px]
                            bg-gradient-to-r from-transparent via-orange-400 to-transparent
                            group-hover:w-3/4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                            {/* Subtle Top Accent */}
                            <div className="absolute top-0 left-8 w-12 h-[1px] bg-gradient-to-r from-orange-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Premium Number Badge */}
                            <div className="absolute top-6 right-6 w-9 h-9 rounded-full
                            bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm
                            border border-orange-100/50 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] 
                            flex items-center justify-center
                            group-hover:scale-110 group-hover:border-orange-200/80 group-hover:shadow-[0_4px_12px_rgba(249,115,22,0.1),inset_0_1px_2px_rgba(255,255,255,1)]
                            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                <span className="text-xs font-bold text-orange-400 group-hover:text-orange-600 transition-colors duration-300">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>

                            <div className="relative z-10 pt-2">
                                <h3 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-orange-600 transition-colors duration-300 tracking-tight pr-8">
                                    {item.title}
                                </h3>

                                <p className="text-slate-500 text-base leading-relaxed font-medium">
                                    Designed to improve team efficiency, communication, and overall workflow management.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Premium Developer Keyframes */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-24px); filter: blur(8px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(32px); filter: blur(8px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes breathe {
                    0% { transform: scale(1) translateY(0); opacity: 0.8; }
                    100% { transform: scale(1.05) translateY(-10px); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default FeaturesGridSection;