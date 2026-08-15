import axios from "axios";
import {
    CheckCircle,
    Loader2,
    RotateCcw,
    ShieldCheck
} from "lucide-react";

import React, { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { LuTerminal, LuShieldCheck } from "react-icons/lu";

const VerifyOTP = () => {

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const inputRefs = useRef([]);

    const { email } = useParams();

    const navigate = useNavigate();

    //* handle otp input
    const handleChange = (index, value) => {

        if (!/^\d?$/.test(value)) return;

        const updatedOtp = [...otp];

        updatedOtp[index] = value;

        setOtp(updatedOtp);

        //* auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    //* backspace focus
    const handleKeyDown = (index, e) => {

        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    //* handle paste otp
    const handlePaste = (e) => {

        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .trim();

        //* only digits
        if (!/^\d+$/.test(pastedData)) return;

        const pastedOtp = pastedData
            .slice(0, 6)
            .split("");

        const updatedOtp = [...otp];

        pastedOtp.forEach((digit, index) => {
            updatedOtp[index] = digit;
        });

        setOtp(updatedOtp);

        //* focus last filled input
        const focusIndex = pastedOtp.length - 1;

        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    //* verify otp
    const handleVerify = async () => {

        setError("");

        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
            return setError("Please enter a valid 6-digit OTP");
        }

        try {

            setIsLoading(true);

            const res = await axiosInstance.post(
                `/api/auth/verify-otp/${email}`,
                {
                    otp: finalOtp
                }
            );

            if (res.data.success) {

                setSuccessMessage(
                    res.data.message || "OTP verified successfully"
                );

                setIsVerified(true);

                toast.success(
                    res.data.message || "OTP verified"
                );

                //* redirect
                setTimeout(() => {
                    navigate(`/change-password/${email}`);
                }, 2000);
            }

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Invalid OTP"
            );

            toast.error(
                error.response?.data?.message ||
                "Verification failed"
            );

        } finally {
            setIsLoading(false);
        }
    };

    //* clear otp
    const clearOtp = () => {

        setOtp(["", "", "", "", "", ""]);

        setError("");

        inputRefs.current[0]?.focus();
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex items-center justify-center px-4 py-10 font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Ambient Orbs (Deep Dark Mode Neon) */}
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

            <div className="relative w-full max-w-md">

                {/* Card */}
                <div className="bg-zinc-900/60 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-[2.5rem] overflow-hidden border border-white/10 transition-all duration-500">

                    {/* Top Header with Futuristic Gradient Glow */}
                    <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 px-8 py-8 text-center relative overflow-hidden border-b border-white/5">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-zinc-900/80 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-md">
                            <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        </div>

                        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <LuTerminal size={12} className="text-cyan-400" />
                            <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                                Secure Token Auth
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Verify OTP
                        </h1>

                        <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-medium font-mono">
                            Enter the 6-digit code sent to your email
                        </p>

                        <p className="text-cyan-300 font-bold text-xs sm:text-sm mt-3 bg-zinc-900/80 py-1.5 px-3 rounded-full inline-block backdrop-blur-md border border-white/5 break-all font-mono">
                            {email}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div className="flex items-center gap-2.5 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-center mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {isVerified ? (

                            <div className="text-center py-4">

                                <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                    <CheckCircle className="w-10 h-10 text-cyan-400" />
                                </div>

                                <h2 className="text-2xl font-bold text-white">
                                    Verification Successful
                                </h2>

                                <p className="text-zinc-400 text-sm mt-2 font-medium font-mono">
                                    Redirecting to change password...
                                </p>

                                <div className="flex justify-center mt-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                </div>
                            </div>

                        ) : (

                            <>
                                {/* OTP Inputs */}
                                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">

                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={digit}
                                            maxLength={1}
                                            ref={(el) =>
                                                (inputRefs.current[index] = el)
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(index, e)
                                            }
                                            onPaste={handlePaste}
                                            className="w-11 h-12 sm:w-12 sm:h-14 md:w-14 md:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border border-white/10 outline-none bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50 transition-all shrink-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] font-mono"
                                        />
                                    ))}
                                </div>

                                {/* Verify Button */}
                                <div className="relative group cursor-pointer w-full mt-2">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                                    <button
                                        onClick={handleVerify}
                                        disabled={
                                            isLoading ||
                                            otp.some((digit) => digit === "")
                                        }
                                        className="relative w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide overflow-hidden"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {isLoading ? (
                                            <span className="flex items-center gap-2 relative z-10 font-mono text-sm">
                                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                                Verifying...
                                            </span>
                                        ) : (
                                            <span className="relative z-10 flex items-center gap-2 font-mono text-sm">
                                                <LuShieldCheck size={16} className="text-cyan-400" /> Verify OTP
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Clear Button */}
                                <button
                                    onClick={clearOtp}
                                    disabled={isLoading}
                                    className="
                                        w-full h-12 mt-3 border border-white/10
                                        hover:bg-zinc-900 rounded-2xl
                                        text-zinc-300 font-semibold font-mono text-xs
                                        transition-all flex items-center justify-center cursor-pointer
                                    "
                                >
                                    <RotateCcw className="w-4 h-4 mr-2 text-cyan-400" />
                                    Clear OTP
                                </button>

                                {/* Footer */}
                                <p className="text-center text-sm text-zinc-400 mt-6 font-medium">
                                    Wrong email?{" "}
                                    <Link
                                        to="/forgot-password"
                                        className="text-cyan-400 hover:text-cyan-300 underline-offset-4 font-bold hover:underline cursor-pointer transition-all font-mono"
                                    >
                                        Go Back
                                    </Link>
                                </p>
                            </>
                        )}
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

export default VerifyOTP;