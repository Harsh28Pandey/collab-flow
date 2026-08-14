// src/pages/VerifyEmail.jsx
import { MailCheck, ArrowLeft } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuTerminal, LuShieldCheck } from "react-icons/lu";

const VerifyEmail = () => {

    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex items-center justify-center px-4 py-8 font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Ambient Orbs (Deep Dark Mode Neon) */}
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

            <div className="relative w-full max-w-md">

                {/* 🔙 BACK BUTTON */}
                <div className="mb-6 text-left">
                    <button
                        onClick={() => navigate(-1) || navigate("/")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/60 text-cyan-300 font-semibold border border-white/5 hover:border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-zinc-800/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                    >
                        <ArrowLeft
                            size={16}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                        />
                        <span className="text-xs font-mono tracking-wider uppercase">
                            Back
                        </span>
                    </button>
                </div>

                {/* Card */}
                <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500">

                    {/* Top Header with Futuristic Gradient Glow */}
                    <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 px-6 sm:px-8 py-9 text-center relative overflow-hidden border-b border-white/5">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-zinc-900/80 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg backdrop-blur-md">
                            <MailCheck className="w-8 h-8 text-cyan-400" />
                        </div>

                        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <LuTerminal size={12} className="text-cyan-400" />
                            <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                                Account Verification
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Verify Your Email
                        </h1>

                        <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed max-w-xs mx-auto font-medium font-mono">
                            We’ve sent a verification link to your email.
                        </p>

                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 text-center">

                        <div className="bg-zinc-900/80 border border-white/5 rounded-2xl px-5 py-4">
                            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-mono">
                                Please check your inbox and verify your account
                                to continue using Collab Flow.
                            </p>
                        </div>

                        {/* Button */}
                        <div className="relative group cursor-pointer w-full mt-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                            <Link
                                to="/login"
                                className="relative w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 tracking-wide overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 flex items-center gap-2 font-mono text-sm">
                                    <LuShieldCheck size={16} className="text-cyan-400" /> Back to Login
                                </span>
                            </Link>
                        </div>

                        {/* Small Text */}
                        <p className="text-xs sm:text-sm text-zinc-500 mt-5 leading-relaxed font-mono">
                            Didn’t receive the email? Check your spam folder.
                        </p>

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-zinc-500 text-xs mt-6 font-mono tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default VerifyEmail;