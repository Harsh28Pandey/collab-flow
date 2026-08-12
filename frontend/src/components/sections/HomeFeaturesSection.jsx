import React from "react";

const HomeFeaturesSection = () => {
    return (
        <section className="relative py-24 md:py-32 px-4 md:px-6 bg-[#fafaf9] overflow-hidden flex flex-col items-center">

            {/* Premium Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-yellow-100/60 to-orange-50/10 blur-[120px] rounded-[100%] animate-[breathe_10s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 max-w-6xl mx-auto w-full">

                {/* Section Heading */}
                <div className="text-center mb-16 md:mb-24 animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">

                    {/* Minimalist SaaS Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(234,179,8,0.08)] cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-yellow-500 to-orange-500"></span>
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                            Features
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                        Powerful{" "}
                        <span className="relative inline-block px-2">
                            <span className="absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-40 rounded-full" />
                            <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                                Features
                            </span>
                        </span>
                    </h2>

                    <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-slate-500 font-medium leading-relaxed tracking-wide">
                        Everything you need to collaborate efficiently, stay aligned, and build incredible things together.
                    </p>
                </div>

                {/* Tactile Cards Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-left">
                    {[
                        { title: "Real-time Collaboration", delay: "0s" },
                        { title: "Smart Task Management", delay: "0.1s" },
                        { title: "Central Workspace", delay: "0.2s" },
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
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-yellow-50/50
                            opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            {/* Sophisticated Bottom Glow Indicator */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px]
                            bg-gradient-to-r from-transparent via-orange-400 to-transparent
                            group-hover:w-3/4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                            {/* Subtle Top Accent */}
                            <div className="absolute top-0 left-8 w-12 h-[1px] bg-gradient-to-r from-orange-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-orange-600 transition-colors duration-300 tracking-tight">
                                    {item.title}
                                </h3>

                                <p className="text-slate-500 text-base leading-relaxed font-medium">
                                    Boost productivity with structured collaboration and efficient workflows designed for modern teams.
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
                    100% { transform: scale(1.05) translateY(-20px); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default HomeFeaturesSection;