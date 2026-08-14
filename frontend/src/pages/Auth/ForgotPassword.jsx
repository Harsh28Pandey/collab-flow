// src/pages/ForgotPassword.jsx
import axiosInstance from "../../utils/axiosInstance.js";
import { CheckCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuTerminal, LuShieldCheck } from "react-icons/lu";

const ForgotPassword = () => {

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const navigate = useNavigate();

    //* handle forgot password
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            return setError("Email is required");
        }

        try {

            setIsLoading(true);

            const res = await axiosInstance.post(
                "/api/auth/forgot-password",
                { email }
            );

            if (res.data.success) {

                setIsSubmitted(true);

                toast.success(
                    res.data.message || "OTP sent successfully"
                );

                //* redirect after 5 sec
                setTimeout(() => {
                    navigate(`/verify-otp/${email}`);
                }, 5000);
            }

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Something went wrong"
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to send OTP"
            );

        } finally {
            setIsLoading(false);
        }
    };

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

                <div className="bg-zinc-900/60 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-[2.5rem] overflow-hidden border border-white/10 transition-all duration-500">

                    {/* Header with Futuristic Gradient Glow */}
                    <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 px-6 sm:px-8 py-8 text-center relative overflow-hidden border-b border-white/5">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-zinc-900/80 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg backdrop-blur-md">
                            <Mail className="text-cyan-400 w-8 h-8" />
                        </div>

                        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <LuTerminal size={12} className="text-cyan-400" />
                            <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                                Password Recovery
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Forgot Password
                        </h1>

                        <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed max-w-xs mx-auto font-medium font-mono">
                            Reset your account password securely
                        </p>

                    </div>

                    <div className="p-6 sm:p-8">

                        {isSubmitted ? (

                            <div className="text-center py-2">

                                <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-cyan-500/20">
                                    <CheckCircle className="w-10 h-10 text-cyan-400" />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">
                                    OTP Sent Successfully
                                </h2>

                                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                    We have sent an OTP to:
                                </p>

                                <p className="font-bold text-cyan-400 mt-1 break-all text-sm sm:text-base font-mono">
                                    {email}
                                </p>

                                <div className="bg-zinc-900/80 border border-white/5 rounded-2xl px-4 py-3 mt-5">
                                    <p className="text-cyan-300 text-xs font-mono font-semibold">
                                        Redirecting to OTP verification...
                                    </p>
                                </div>

                            </div>

                        ) : (

                            <form
                                onSubmit={handleForgotPassword}
                                className="space-y-5"
                            >

                                {error && (
                                    <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="text-left">
                                    <label className="block text-xs font-mono text-zinc-300 tracking-wide mb-2">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="w-full h-12 px-4 rounded-2xl border border-white/10 outline-none bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50 transition-all font-mono text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                                    />
                                </div>

                                <div className="relative group cursor-pointer w-full mt-2">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide overflow-hidden"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {isLoading ? (
                                            <span className="flex items-center gap-2 relative z-10 font-mono text-sm">
                                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                                Sending OTP...
                                            </span>
                                        ) : (
                                            <span className="relative z-10 flex items-center gap-2 font-mono text-sm">
                                                <LuShieldCheck size={16} className="text-cyan-400" /> Send OTP
                                            </span>
                                        )}
                                    </button>
                                </div>

                            </form>
                        )}

                        {!isSubmitted && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-zinc-400 font-medium">
                                    Remember your password?{" "}
                                    <Link
                                        to="/login"
                                        className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline underline-offset-4 transition-all font-mono"
                                    >
                                        Login
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-zinc-500 text-xs mt-6 font-mono tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default ForgotPassword;