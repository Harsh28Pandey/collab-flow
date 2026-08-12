import React from "react";

const HomeAboutSection = () => {
    return (
        <section className="relative py-24 md:py-32 px-4 md:px-6 bg-[#fafaf9] overflow-hidden flex flex-col items-center">

            {/* Premium Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-90">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
            </div>

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-orange-100/40 to-yellow-50/20 blur-[130px] rounded-full animate-[breathe_10s_ease-in-out_infinite_alternate] pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">

                {/* Minimalist SaaS Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] cursor-default animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                        About Us
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 text-slate-900 leading-[1.1] tracking-tight animate-[fadeInDown_0.8s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                    What is{" "}
                    <span className="relative inline-block px-2">
                        <span className="absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-40 rounded-full" />
                        <span className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                            Collab Flow?
                        </span>
                    </span>
                </h2>

                {/* Clean, Readable Typography for Description */}
                <p className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-500 font-medium leading-relaxed tracking-wide animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
                    Collab Flow is a modern team collaboration platform that helps teams stay organized, communicate clearly, and manage tasks efficiently — effortlessly eliminating confusion and delays.
                </p>

                {/* Sophisticated Decorative Divider */}
                <div className="mt-16 flex items-center justify-center gap-4 opacity-80 animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-orange-300/80" />
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-6 h-6 bg-orange-200/50 rounded-full blur-sm" />
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                    </div>
                    <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-yellow-300/80" />
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
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.5; }
                }
            `}</style>
        </section>
    );
};

export default HomeAboutSection;