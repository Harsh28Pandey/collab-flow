import React from "react";
import { LuSparkles } from "react-icons/lu";

const FooterSection = () => {
    return (
        <footer className="relative bg-zinc-950 py-5 md:py-6 text-center overflow-hidden flex flex-col items-center border-t border-white/5 font-sans">

            {/* Subtle Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_100%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            {/* Refined Ethereal Bottom Glow */}
            <div className="absolute bottom-[-60%] left-1/2 -translate-x-1/2 w-[400px] h-[100px] bg-gradient-to-t from-blue-600/10 via-purple-600/5 to-transparent blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-1.5">

                {/* Minimalist Logo / Brand Highlight */}
                <div className="flex items-center justify-center gap-2">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 via-blue-500 to-violet-500 p-[1px] shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                        <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
                            <LuSparkles className="w-2.5 h-2.5 text-cyan-400" />
                        </div>
                    </div>
                    <span className="text-[15px] font-extrabold tracking-tight text-zinc-100">
                        Collab{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Flow
                        </span>
                    </span>
                </div>

                {/* Copyright Text */}
                <p className="text-[12px] font-medium text-zinc-500 tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </footer>
    );
};

export default FooterSection;