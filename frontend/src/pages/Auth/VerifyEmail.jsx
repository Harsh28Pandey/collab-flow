import { MailCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const VerifyEmail = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100 flex items-center justify-center px-4 py-8">

            {/* Background Blur Effects */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">

                {/* Card */}
                <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-[0_10px_40px_rgba(37,99,235,0.12)] overflow-hidden">

                    {/* Top */}
                    <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 sm:px-8 py-9 text-center">

                        <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">

                            <MailCheck className="w-8 h-8 text-white" />

                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Verify Your Email
                        </h1>

                        <p className="text-blue-100 text-sm sm:text-base mt-3 leading-6 max-w-xs mx-auto">
                            We’ve sent a verification link to your email.
                        </p>

                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 text-center">

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">

                            <p className="text-gray-700 text-sm sm:text-base leading-7">
                                Please check your inbox and verify your account
                                to continue using Collab Flow.
                            </p>

                        </div>

                        {/* Button */}
                        <Link
                            to="/login"
                            className="mt-6 w-full h-12 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 transition-all duration-300 rounded-2xl text-white font-semibold flex items-center justify-center shadow-lg shadow-blue-200"
                        >
                            Back to Login
                        </Link>

                        {/* Small Text */}
                        <p className="text-xs sm:text-sm text-gray-500 mt-5 leading-6">
                            Didn’t receive the email? Check your spam folder.
                        </p>

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-xs mt-6">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default VerifyEmail;