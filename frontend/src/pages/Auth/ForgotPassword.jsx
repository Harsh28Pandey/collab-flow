import axiosInstance from "../../utils/axiosInstance.js";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
        <div className="relative min-h-screen overflow-hidden bg-[#fafaf9] flex items-center justify-center px-4 py-8">

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Ethereal Ambient Warm Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-yellow-200/40 to-orange-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-orange-200/30 to-yellow-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />

            <div className="relative w-full max-w-md">

                <div className="bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5px] rounded-[2.5rem] overflow-hidden border border-white/80 transition-all duration-500">

                    {/* Header with Warm Orange/Yellow Gradient */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 sm:px-8 py-8 text-center relative overflow-hidden">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg backdrop-blur-md">
                            <Mail className="text-white w-8 h-8" />
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Forgot Password
                        </h1>

                        <p className="text-orange-100 text-sm sm:text-base mt-2 leading-relaxed max-w-xs mx-auto font-medium">
                            Reset your account password securely
                        </p>

                    </div>

                    <div className="p-6 sm:p-8">

                        {isSubmitted ? (

                            <div className="text-center py-2">

                                <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-orange-100">
                                    <CheckCircle className="w-10 h-10 text-orange-500" />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    OTP Sent Successfully
                                </h2>

                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    We have sent an OTP to:
                                </p>

                                <p className="font-bold text-orange-600 mt-1 break-all text-sm sm:text-base">
                                    {email}
                                </p>

                                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 mt-5">
                                    <p className="text-orange-700 text-sm font-semibold">
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
                                    <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50/90 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="text-left">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 outline-none bg-white text-slate-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 disabled:opacity-70 rounded-3xl text-white font-bold transition-all duration-300 flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] cursor-pointer"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending OTP...
                                        </span>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </button>

                            </form>
                        )}

                        {!isSubmitted && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-500 font-medium">
                                    Remember your password?{" "}
                                    <Link
                                        to="/login"
                                        className="text-orange-600 hover:text-orange-700 font-bold hover:underline underline-offset-4 transition-all"
                                    >
                                        Login
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-6 font-medium tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default ForgotPassword;