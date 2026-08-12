import { MailCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const VerifyEmail = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#fafaf9] flex items-center justify-center px-4 py-8">

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Ethereal Ambient Warm Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-yellow-200/40 to-orange-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-orange-200/30 to-yellow-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />

            <div className="relative w-full max-w-md">

                {/* Card */}
                <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">

                    {/* Top Header with Warm Orange/Yellow Gradient */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 sm:px-8 py-9 text-center relative overflow-hidden">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg backdrop-blur-md">
                            <MailCheck className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Verify Your Email
                        </h1>

                        <p className="text-orange-100 text-sm sm:text-base mt-2 leading-relaxed max-w-xs mx-auto font-medium">
                            We’ve sent a verification link to your email.
                        </p>

                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 text-center">

                        <div className="bg-orange-50/80 border border-orange-100 rounded-2xl px-5 py-4">
                            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                                Please check your inbox and verify your account
                                to continue using Collab Flow.
                            </p>
                        </div>

                        {/* Button */}
                        <Link
                            to="/login"
                            className="mt-6 w-full h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 transition-all duration-300 rounded-2xl text-white font-bold flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] cursor-pointer"
                        >
                            Back to Login
                        </Link>

                        {/* Small Text */}
                        <p className="text-xs sm:text-sm text-slate-400 mt-5 leading-relaxed font-medium">
                            Didn’t receive the email? Check your spam folder.
                        </p>

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

export default VerifyEmail;