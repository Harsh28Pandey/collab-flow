import React from "react";

const Model = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fadeIn">

            {/* BACKDROP BLUR WITH DEEP OBSIDIAN TINT */}
            <div
                className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* MODAL BOX - ULTRA COMPACT & SCROLL-FREE OPTIMIZED */}
            <div className="relative w-full max-w-sm sm:max-w-md bg-zinc-950/95 backdrop-blur-3xl rounded-[1.75rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-4 sm:p-5 z-[10000] transform transition-all duration-300 scale-100">

                {/* Top Ambient Cyber Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>

                {/* Subtle Grid Corner Accents */}
                <div className="absolute top-3 left-3 w-1 h-1 border-t border-l border-white/20 pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-1 h-1 border-t border-r border-white/20 pointer-events-none"></div>

                {/* HEADER */}
                <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/5">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)] shrink-0"></span>
                        <h2 className="text-xs sm:text-sm font-mono font-black text-white tracking-wider uppercase truncate">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white text-xs cursor-pointer border border-white/10 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 active:scale-95 shadow-inner shrink-0"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY CONTENT - COMPACT SPACING TO AVOID SCROLLING */}
                <div className="text-zinc-200 font-mono text-xs leading-relaxed space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Model;