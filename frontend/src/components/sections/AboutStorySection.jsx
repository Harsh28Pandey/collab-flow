import React from "react";

const AboutStorySection = () => {
    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">

            {/* Background orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-indigo-100 opacity-60 blur-[100px] rounded-full animate-pulse pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 animate-[fadeInDown_0.7s_ease_both]">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">
                        Our Story
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl md:text-4xl font-extrabold mb-6 text-gray-900 leading-tight tracking-tight animate-[fadeInDown_0.7s_ease_0.1s_both]">
                    How It All{" "}
                    <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                            Began
                        </span>
                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400/0 via-blue-500/60 to-sky-400/0" />
                    </span>
                </h2>

                {/* Story text */}
                <p className="text-gray-500 leading-relaxed text-base md:text-lg max-w-3xl mx-auto animate-[fadeInUp_0.7s_ease_0.2s_both]">
                    Collab Flow started as a simple idea to solve everyday team problems —
                    scattered communication, missed tasks, and lack of coordination.
                    We built a platform where everything stays structured, simple, and efficient.
                </p>

                {/* Decorative divider */}
                <div className="mt-10 flex items-center justify-center gap-3 animate-[fadeInUp_0.7s_ease_0.35s_both]">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 animate-pulse" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-sky-300" />
                </div>

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

export default AboutStorySection;