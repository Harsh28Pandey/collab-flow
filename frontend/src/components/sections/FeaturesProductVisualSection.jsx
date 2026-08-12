import React from "react";

const FeaturesProductVisualSection = () => {
    return (
        <section className="relative py-24 md:py-32 px-4 md:px-6 text-center bg-[#fafaf9] overflow-hidden flex flex-col items-center">

            {/* Premium Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-yellow-200/40 to-orange-100/10 blur-[130px] rounded-full animate-[breathe_12s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[500px] bg-gradient-to-tl from-orange-200/30 to-yellow-100/20 blur-[140px] rounded-full animate-[breathe_9s_ease-in-out_infinite_alternate-reverse] pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 max-w-5xl mx-auto w-full">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] cursor-default animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                        Live Preview
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-4xl md:text-6xl font-extrabold mb-16 text-slate-900 leading-[1.1] tracking-tight animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    See{" "}
                    <span className="relative inline-block px-2">
                        <span className="absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-40 rounded-full" />
                        <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                            Collab Flow
                        </span>
                    </span>
                    {" "}in Action
                </h2>

                {/* Premium 3D Glass Showcase Container */}
                <div className="animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
                    <div className="relative group transform transition-all duration-700 hover:scale-[1.01] cursor-default perspective-1000">

                        {/* Sophisticated Outer glow on hover */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200
                            opacity-0 group-hover:opacity-40 blur-2xl rounded-[2.5rem]
                            transition-opacity duration-700 pointer-events-none" />

                        {/* Outer Glass Frame */}
                        <div className="relative bg-white/40 backdrop-blur-2xl border border-white/80 p-3 md:p-5 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)]
                            transition-all duration-700 group-hover:border-white group-hover:shadow-[0_20px_80px_rgba(249,115,22,0.12),inset_0_2px_4px_rgba(255,255,255,1)]">

                            {/* Inner Screen Area */}
                            <div className="bg-[#fafaf9]/90 rounded-[1.5rem] p-6 md:p-10 relative overflow-hidden border border-slate-100 shadow-inner">

                                {/* Soft Screen Reflection */}
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

                                {/* UI Header */}
                                <div className="flex items-center justify-between mb-10 relative z-10 animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_0.4s_both]">
                                    <h3 className="text-slate-800 font-extrabold text-2xl tracking-tight">
                                        Team Workspace
                                    </h3>
                                    {/* Mock UI Elements */}
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    </div>
                                </div>

                                {/* Feature Cards Grid */}
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                                    {[
                                        { title: "Tasks", desc: "Organize and assign tasks clearly", delay: "0.5s" },
                                        { title: "Messages", desc: "Communicate instantly with your team", delay: "0.6s" },
                                        { title: "Progress", desc: "Track real-time work updates", delay: "0.7s" },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            style={{ animationDelay: item.delay }}
                                            className="relative bg-white p-6 rounded-2xl
                                                border border-slate-100 hover:border-orange-200/60
                                                hover:-translate-y-1.5
                                                shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(249,115,22,0.06)]
                                                transition-all duration-500 cursor-pointer group/card overflow-hidden
                                                animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both]"
                                        >
                                            {/* Card Top Accent Line */}
                                            <div className="absolute top-0 left-0 right-0 h-[2px]
                                                bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400
                                                scale-x-0 group-hover/card:scale-x-100
                                                transition-transform duration-500 origin-left rounded-t-2xl" />

                                            {/* Subtle Inner Card Glow */}
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/30 to-yellow-50/30
                                                opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            <div className="relative z-10">
                                                <p className="font-bold text-lg text-slate-800 group-hover/card:text-orange-600 transition-colors duration-300 tracking-tight">
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">
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
                    100% { transform: scale(1.05) translateY(-15px); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default FeaturesProductVisualSection;