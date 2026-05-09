import React from "react";

const HomeProblemsSection = () => {
    return (
        <section className="relative bg-gradient-to-b from-blue-50 to-gray-50 py-16 md:py-24 px-4 md:px-6 overflow-hidden">

            {/* Background orbs */}
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-indigo-200 opacity-30 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-sky-200 opacity-25 blur-[120px] rounded-full animate-pulse [animation-delay:1.5s] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Section Heading */}
                <div className="text-center mb-12 md:mb-16 animate-[fadeInDown_0.7s_ease_both]">

                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">
                            Pain Points
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        Problems{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                                We Solve
                            </span>
                            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400/0 via-blue-500/60 to-sky-400/0" />
                        </span>
                    </h2>

                    <p className="text-gray-400 mt-3 text-sm md:text-base">
                        Common collaboration issues that slow teams down
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        { title: "Lack of Team Communication", delay: "0s" },
                        { title: "Task Mismanagement", delay: "0.1s" },
                        { title: "Poor Collaboration", delay: "0.2s" },
                        { title: "File & Resource Scattering", delay: "0.3s" },
                        { title: "No Progress Tracking", delay: "0.4s" },
                        { title: "Time Wastage in Coordination", delay: "0.5s" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            style={{ animationDelay: item.delay }}
                            className="group relative bg-white p-6 md:p-7 rounded-2xl shadow-sm
                            hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)]
                            hover:-translate-y-2 active:scale-95
                            transition-all duration-300
                            border border-gray-100 hover:border-indigo-100
                            cursor-pointer overflow-hidden
                            animate-[fadeInUp_0.6s_ease_both]"
                        >

                            {/* Card glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-sky-50/40
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]
                            bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400
                            scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-2xl" />

                            <div className="relative z-10">

                                <h3 className="font-bold text-base md:text-lg mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                                    {item.title}
                                </h3>

                                <p className="text-gray-400 text-sm leading-relaxed">
                                    CollabFlow provides a centralized and structured system to solve this efficiently.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(32px);
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

export default HomeProblemsSection;