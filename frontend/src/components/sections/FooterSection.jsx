import React from "react";

const FooterSection = () => {
    return (
        <footer className="relative bg-[#fafaf9] py-10 md:py-12 text-center overflow-hidden flex flex-col items-center">

            {/* Subtle Architectural Grid (to blend with above sections) */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_20%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            {/* Architectural Top Divider */}
            <div className="absolute top-0 left-0 right-0 flex justify-center opacity-80">
                <div className="h-[1px] w-full max-w-5xl bg-gradient-to-r from-transparent via-orange-200/60 to-transparent" />
            </div>

            {/* Refined Ethereal Bottom Glow */}
            <div className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-orange-100/50 to-transparent blur-[100px] rounded-[100%] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Minimalist Logo / Brand Highlight */}
                <div className="mb-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 shadow-[0_2px_8px_rgba(249,115,22,0.4)]" />
                    <span className="text-lg font-extrabold tracking-tight text-slate-800">
                        Collab{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                            Flow
                        </span>
                    </span>
                </div>

                {/* Copyright Text */}
                <p className="text-sm font-medium text-slate-500/80 tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default FooterSection;