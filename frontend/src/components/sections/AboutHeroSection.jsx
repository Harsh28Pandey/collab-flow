import React from "react";

const AboutHeroSection = () => {
    return (
        <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 md:px-6 text-center bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white overflow-hidden">

            {/* Animated background orbs */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-400 opacity-25 blur-[130px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-sky-300 opacity-20 blur-[130px] rounded-full animate-pulse [animation-delay:1.5s] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-blue-500 opacity-10 blur-[100px] rounded-full animate-pulse [animation-delay:0.8s] pointer-events-none" />

            {/* Spinning rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5 animate-spin [animation-duration:22s] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 animate-spin [animation-duration:16s] [animation-direction:reverse] pointer-events-none" />

            {/* Floating particles */}
            <div className="absolute top-16 left-[12%] w-1.5 h-1.5 bg-white opacity-40 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="absolute top-24 right-[18%] w-1 h-1 bg-sky-200 opacity-50 rounded-full animate-bounce [animation-delay:0.6s]" />
            <div className="absolute bottom-16 left-[22%] w-1 h-1 bg-indigo-200 opacity-40 rounded-full animate-bounce [animation-delay:1s]" />
            <div className="absolute bottom-20 right-[14%] w-1.5 h-1.5 bg-white opacity-30 rounded-full animate-bounce [animation-delay:0.4s]" />
            <div className="absolute top-1/3 left-[5%] w-1 h-1 bg-sky-300 opacity-50 rounded-full animate-ping [animation-delay:1.2s]" />
            <div className="absolute bottom-1/3 right-[6%] w-1 h-1 bg-indigo-300 opacity-40 rounded-full animate-ping [animation-delay:0.9s]" />

            {/* Content */}
            <div className="relative z-10">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm animate-[fadeInDown_0.7s_ease_both]">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-sky-100">
                        Our Story
                    </span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-lg animate-[fadeInDown_0.7s_ease_0.1s_both]">
                    About{" "}
                    <span className="bg-gradient-to-r from-white via-sky-100 to-indigo-100 bg-clip-text text-transparent">
                        Collab Flow
                    </span>
                </h1>

                {/* Subheading */}
                <p className="max-w-2xl mx-auto text-base md:text-lg text-white/80 leading-relaxed animate-[fadeInUp_0.7s_ease_0.2s_both]">
                    Building a smarter way for teams to collaborate, manage work,
                    and stay organized — without confusion.
                </p>

                {/* Decorative divider */}
                <div className="mt-8 flex items-center justify-center gap-3 animate-[fadeInUp_0.7s_ease_0.35s_both]">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
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

export default AboutHeroSection;