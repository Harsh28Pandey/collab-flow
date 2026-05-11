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
                "http://localhost:8000/api/auth/forgot-password",
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* Main Card */}
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100">

                    {/* Top Section */}
                    <div className="bg-blue-600 p-8 text-center">

                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-white w-8 h-8" />
                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Forgot Password
                        </h1>

                        <p className="text-blue-100 text-sm mt-2">
                            Reset your account password securely
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">

                        {isSubmitted ? (

                            <div className="text-center">

                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle className="w-10 h-10 text-blue-600" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    OTP Sent Successfully
                                </h2>

                                <p className="text-gray-600 text-sm leading-6">
                                    We have sent an OTP to:
                                </p>

                                <p className="font-semibold text-blue-600 mt-1 break-all">
                                    {email}
                                </p>

                                <p className="text-gray-500 text-sm mt-4">
                                    Redirecting to OTP verification...
                                </p>
                            </div>

                        ) : (

                            <form
                                onSubmit={handleForgotPassword}
                                className="space-y-5"
                            >

                                {/* Error */}
                                {error && (
                                    <div className="bg-red-100 border border-red-300 text-red-600 text-sm rounded-xl px-4 py-3">
                                        {error}
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={isLoading}
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-all rounded-xl text-white font-semibold flex items-center justify-center cursor-pointer"
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

                        {/* Footer */}
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

                {/* Bottom Text */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2026 Collab Flow. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;