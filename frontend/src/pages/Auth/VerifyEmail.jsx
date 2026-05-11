import { MailCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const VerifyEmail = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">

                    {/* Top */}
                    <div className="bg-blue-600 px-6 py-8 text-center">

                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MailCheck className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-2xl font-bold text-white">
                            Verify Your Email
                        </h1>

                        <p className="text-blue-100 text-sm mt-2">
                            We’ve sent a verification link to your email.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 text-center">

                        <p className="text-gray-600 text-sm leading-6">
                            Please check your inbox and verify your account
                            to continue using Collab Flow.
                        </p>

                        {/* Button */}
                        <Link
                            to="/login"
                            className="mt-6 w-full h-11 bg-blue-600 hover:bg-blue-700 transition-all rounded-xl text-white font-medium flex items-center justify-center"
                        >
                            Back to Login
                        </Link>

                        {/* Small Text */}
                        <p className="text-xs text-gray-500 mt-4">
                            Didn’t receive the email? Check your spam folder.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-5">
                    © 2026 Collab Flow
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;