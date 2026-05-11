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
                `http://localhost:8000/api/auth/verify-otp/${email}`,
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">

                    {/* Top */}
                    <div className="bg-blue-600 px-8 py-8 text-center">

                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Verify OTP
                        </h1>

                        <p className="text-blue-100 text-sm mt-2 leading-6">
                            Enter the 6-digit code sent to your email
                        </p>

                        <p className="text-white font-medium text-sm mt-2 break-all">
                            {email}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">

                        {/* Error */}
                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div className="bg-blue-100 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3 mb-5 text-center">
                                {successMessage}
                            </div>
                        )}

                        {isVerified ? (

                            <div className="text-center py-4">

                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle className="w-10 h-10 text-blue-600" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800">
                                    Verification Successful
                                </h2>

                                <p className="text-gray-600 text-sm mt-3">
                                    Redirecting to change password...
                                </p>

                                <div className="flex justify-center mt-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                </div>
                            </div>

                        ) : (

                            <>
                                {/* OTP Inputs */}
                                <div className="flex justify-between gap-2 mb-6">

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
                                            className="
                                                w-12 h-14 md:w-14 md:h-14
                                                text-center text-xl font-bold
                                                rounded-xl border-2 border-gray-300
                                                outline-none
                                                focus:border-blue-500
                                                focus:ring-4 focus:ring-blue-100
                                                transition-all
                                            "
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
                                        w-full h-12 bg-blue-600
                                        hover:bg-blue-700
                                        disabled:bg-blue-300
                                        rounded-xl text-white font-semibold
                                        transition-all flex items-center justify-center cursor-pointer
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
                                        w-full h-12 mt-3 border border-blue-200
                                        hover:bg-blue-50 rounded-xl
                                        text-blue-600 font-medium
                                        transition-all flex items-center justify-center cursor-pointer
                                    "
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Clear OTP
                                </button>

                                {/* Footer */}
                                <p className="text-center text-sm text-gray-600 mt-6">

                                    Wrong email?{" "}

                                    <Link
                                        to="/forgot-password"
                                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                                    >
                                        Go Back
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2026 Collab Flow. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default VerifyOTP;