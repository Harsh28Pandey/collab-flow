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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100 flex items-center justify-center px-4 py-8">

            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">

                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(37,99,235,0.12)] rounded-3xl overflow-hidden border border-blue-100">

                    <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 sm:px-8 py-8 text-center">

                        <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">

                            <Mail className="text-white w-8 h-8" />

                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Forgot Password
                        </h1>

                        <p className="text-blue-100 text-sm sm:text-base mt-3 leading-6 max-w-xs mx-auto">
                            Reset your account password securely
                        </p>

                    </div>

                    <div className="p-6 sm:p-8">

                        {isSubmitted ? (

                            <div className="text-center py-2">

                                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">

                                    <CheckCircle className="w-10 h-10 text-blue-600" />

                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    OTP Sent Successfully
                                </h2>

                                <p className="text-gray-600 text-sm leading-6">
                                    We have sent an OTP to:
                                </p>

                                <p className="font-semibold text-blue-600 mt-2 break-all text-sm sm:text-base">
                                    {email}
                                </p>

                                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mt-5">

                                    <p className="text-blue-700 text-sm">
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
                                    <div className="bg-red-100 border border-red-300 text-red-600 text-sm rounded-2xl px-4 py-3">
                                        {error}
                                    </div>
                                )}

                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="w-full h-12 px-4 rounded-2xl border border-gray-300 outline-none bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-70 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-200 cursor-pointer"
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

                                <p className="text-sm text-gray-600">

                                    Remember your password?{" "}

                                    <Link
                                        to="/login"
                                        className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                                    >
                                        Login
                                    </Link>

                                </p>

                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default ForgotPassword;