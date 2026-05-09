import React from "react";

const FeaturesGridSection = () => {
    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">

            {/* Background orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-100 opacity-50 blur-[100px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-100 opacity-40 blur-[100px] rounded-full animate-pulse [animation-delay:1.5s] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-100 opacity-30 blur-[100px] rounded-full animate-pulse [animation-delay:0.8s] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Section Heading */}
                <div className="text-center mb-12 md:mb-16 animate-[fadeInDown_0.7s_ease_both]">

                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">
                            Core Features
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        Built to{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                                Simplify Teamwork
                            </span>
                            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400/0 via-blue-500/60 to-sky-400/0" />
                        </span>
                    </h2>
                    <p className="text-gray-400 mt-3 text-sm md:text-base">
                        Built to simplify teamwork and boost productivity
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
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
                            className="group relative bg-white border border-gray-100 hover:border-indigo-100
                                       p-6 md:p-7 rounded-2xl shadow-sm
                                       hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)]
                                       hover:-translate-y-2 active:scale-95
                                       transition-all duration-300 cursor-pointer overflow-hidden
                                       animate-[fadeInUp_0.6s_ease_both]"
                        >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-transparent to-sky-50/40
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]
                                            bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400
                                            scale-x-0 group-hover:scale-x-100
                                            transition-transform duration-500 origin-left rounded-t-2xl" />

                            {/* Bottom glow */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px
                                            bg-gradient-to-r from-transparent via-indigo-300 to-transparent
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Number badge */}
                            <div className="absolute top-4 right-4 w-7 h-7 rounded-full
                                            bg-gradient-to-br from-indigo-50 to-sky-50
                                            border border-indigo-100 flex items-center justify-center
                                            group-hover:border-indigo-200 transition-all duration-300">
                                <span className="text-[10px] font-bold text-indigo-400">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-base md:text-lg mb-2 text-gray-800
                                               group-hover:text-indigo-600 transition-colors duration-300 pr-8">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Designed to improve team efficiency and workflow management.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(32px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
};

export default FeaturesGridSection;