import React from "react";

const FeaturesProductVisualSection = () => {
    return (
        <section className="relative py-20 md:py-28 px-4 md:px-6 text-center bg-gradient-to-br from-blue-50 to-gray-50 overflow-hidden">

            {/* Background orbs */}
            <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-indigo-200 opacity-40 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-sky-200 opacity-30 blur-[120px] rounded-full animate-pulse [animation-delay:1.5s] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-blue-100 opacity-40 blur-[80px] rounded-full animate-pulse [animation-delay:0.8s] pointer-events-none" />

            {/* Floating particles */}
            <div className="absolute top-12 left-[10%] w-1.5 h-1.5 bg-indigo-300 opacity-50 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="absolute top-20 right-[14%] w-1 h-1 bg-sky-300 opacity-40 rounded-full animate-bounce [animation-delay:0.6s]" />
            <div className="absolute bottom-12 left-[20%] w-1 h-1 bg-indigo-200 opacity-40 rounded-full animate-ping [animation-delay:1s]" />
            <div className="absolute bottom-16 right-[18%] w-1.5 h-1.5 bg-sky-200 opacity-30 rounded-full animate-ping [animation-delay:0.5s]" />

            <div className="relative z-10">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 animate-[fadeInDown_0.7s_ease_both]">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">
                        Live Preview
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-gray-900 leading-tight tracking-tight animate-[fadeInDown_0.7s_ease_0.1s_both]">
                    See{" "}
                    <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                            Collab Flow
                        </span>
                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400/0 via-blue-500/60 to-sky-400/0" />
                    </span>
                    {" "}in Action
                </h2>

                {/* 3D Container */}
                <div className="max-w-5xl mx-auto animate-[fadeInUp_0.8s_ease_0.2s_both]">
                    <div className="relative group transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer">

                        {/* Outer glow on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300 via-blue-300 to-sky-300
                                        opacity-0 group-hover:opacity-40 blur-xl rounded-2xl
                                        transition-opacity duration-500 pointer-events-none" />

                        {/* Glass Frame */}
                        <div className="relative bg-white/70 backdrop-blur-xl border border-gray-100
                                        group-hover:border-indigo-100 p-6 rounded-2xl shadow-xl
                                        transition-all duration-500
                                        group-hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]">

                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl
                                            bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400
                                            scale-x-0 group-hover:scale-x-100
                                            transition-transform duration-700 origin-left" />

                            {/* Inner Screen */}
                            <div className="bg-white rounded-xl p-8 relative overflow-hidden">

                                {/* Light reflection */}
                                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

                                {/* Shimmer sweep on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/40 to-transparent
                                                -translate-x-full group-hover:translate-x-full
                                                transition-transform duration-1000 ease-in-out pointer-events-none" />

                                <h3 className="text-indigo-600 font-bold mb-8 text-xl relative z-10 animate-[fadeInDown_0.6s_ease_0.4s_both]">
                                    Team Workspace
                                </h3>

                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                                    {[
                                        { title: "Tasks", desc: "Organize and assign tasks clearly", delay: "0.5s" },
                                        { title: "Messages", desc: "Communicate instantly with your team", delay: "0.6s" },
                                        { title: "Progress", desc: "Track real-time work updates", delay: "0.7s" },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            style={{ animationDelay: item.delay }}
                                            className="relative bg-blue-50 p-5 rounded-xl
                                                       border border-gray-100 hover:border-indigo-100
                                                       hover:-translate-y-2
                                                       hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]
                                                       transition-all duration-300 cursor-pointer group/card overflow-hidden
                                                       animate-[fadeInUp_0.6s_ease_both]"
                                        >
                                            {/* Card top accent */}
                                            <div className="absolute top-0 left-0 right-0 h-[2px]
                                                            bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400
                                                            scale-x-0 group-hover/card:scale-x-100
                                                            transition-transform duration-500 origin-left rounded-t-xl" />

                                            {/* Card hover glow */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50
                                                            opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                                            <div className="relative z-10">
                                                <p className="font-bold text-lg text-gray-800 group-hover/card:text-indigo-600 transition-colors duration-300">
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
};

export default FeaturesProductVisualSection;