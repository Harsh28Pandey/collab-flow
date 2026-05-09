import React from "react";

const HomeAboutSection = () => {
    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">

            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-100 opacity-60 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto text-center">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />

                    <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">
                        About Us
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl md:text-4xl font-extrabold mb-5 text-gray-900 leading-tight tracking-tight">
                    What is{" "}
                    <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                            Collab Flow?
                        </span>

                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400/0 via-blue-500/60 to-sky-400/0" />
                    </span>
                </h2>

                {/* Description */}
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
                    Collab Flow is a modern team collaboration platform that helps teams
                    stay organized, communicate clearly, and manage tasks efficiently —
                    without confusion or delays.
                </p>

                {/* Decorative divider */}
                <div className="mt-10 flex items-center justify-center gap-3">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-300" />

                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 animate-pulse" />

                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-sky-300" />
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
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

export default HomeAboutSection;