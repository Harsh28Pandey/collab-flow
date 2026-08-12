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
        <div className="relative min-h-screen overflow-hidden bg-[#fafaf9] flex items-center justify-center px-4 py-10">

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Ethereal Ambient Warm Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-yellow-200/40 to-orange-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-orange-200/30 to-yellow-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />

            <div className="relative w-full max-w-md">

                {/* Card */}
                <div className="bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden border border-white/80 transition-all duration-500">

                    {/* Top Header with Warm Orange/Yellow Gradient */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-8 py-8 text-center relative overflow-hidden">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-md">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Verify OTP
                        </h1>

                        <p className="text-orange-100 text-sm mt-2 leading-relaxed font-medium">
                            Enter the 6-digit code sent to your email
                        </p>

                        <p className="text-white font-bold text-xs sm:text-sm mt-3 bg-white/10 py-1.5 px-3 rounded-full inline-block backdrop-blur-md border border-white/20 break-all">
                            {email}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50/90 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div className="flex items-center gap-2.5 text-sm text-emerald-700 bg-emerald-50/90 border border-emerald-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-center mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {isVerified ? (

                            <div className="text-center py-4">

                                <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900">
                                    Verification Successful
                                </h2>

                                <p className="text-slate-500 text-sm mt-2 font-medium">
                                    Redirecting to change password...
                                </p>

                                <div className="flex justify-center mt-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
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
                                            className="w-11 h-12 sm:w-12 sm:h-14 md:w-14 md:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all shrink-0 shadow-sm"
                                        />
                                    ))}
                                </div>

                                {/* Verify Button */}
                                <button
                                    onClick={handleVerify}
                                    disabled={
                                        isLoading ||
                                        otp.some((digit) => digit === "")
                                    }
                                    className="
                                        w-full h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500
                                        hover:opacity-95
                                        disabled:opacity-70
                                        rounded-2xl text-white font-bold
                                        transition-all duration-300 flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] cursor-pointer
                                    "
                                >

                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </button>

                                {/* Clear Button */}
                                <button
                                    onClick={clearOtp}
                                    disabled={isLoading}
                                    className="
                                        w-full h-12 mt-3 border border-slate-200
                                        hover:bg-orange-50/50 rounded-2xl
                                        text-slate-600 font-semibold
                                        transition-all flex items-center justify-center cursor-pointer
                                    "
                                >
                                    <RotateCcw className="w-4 h-4 mr-2 text-orange-500" />
                                    Clear OTP
                                </button>

                                {/* Footer */}
                                <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                                    Wrong email?{" "}
                                    <Link
                                        to="/forgot-password"
                                        className="text-orange-600 hover:text-orange-700 underline-offset-4 font-bold hover:underline cursor-pointer transition-all"
                                    >
                                        Go Back
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-xs mt-6 font-medium tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default VerifyOTP;