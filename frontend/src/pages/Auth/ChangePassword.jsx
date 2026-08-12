import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const ChangePassword = () => {

    const { email } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    //* handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        //* validations
        if (!newPassword || !confirmPassword) {
            return setError("Please fill all fields");
        }

        if (newPassword.length < 6) {
            return setError(
                "Password must be at least 6 characters"
            );
        }

        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setIsLoading(true);

            const res = await axiosInstance.post(
                `/api/auth/change-password/${email}`,
                {
                    newPassword,
                    confirmPassword
                }
            );

            if (res.data.success) {
                setSuccess(
                    res.data.message ||
                    "Password changed successfully"
                );

                toast.success(
                    res.data.message ||
                    "Password updated"
                );

                //* redirect login
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }

        } catch (error) {
            console.log(error);

            setError(
                error.response?.data?.message ||
                "Something went wrong"
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to change password"
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

                <div className="bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden border border-white/80 transition-all duration-500">

                    {/* Header with Warm Orange/Yellow Gradient */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 sm:px-8 py-8 text-center relative overflow-hidden">

                        {/* Shimmer light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

                        <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg backdrop-blur-md">
                            <LockKeyhole className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Change Password
                        </h1>

                        <p className="text-orange-100 text-sm sm:text-base mt-2 leading-relaxed max-w-xs mx-auto font-medium">
                            Create a new secure password
                        </p>

                        <p className="text-white font-bold text-xs sm:text-sm mt-3 bg-white/10 py-1.5 px-3 rounded-full inline-block backdrop-blur-md border border-white/20 break-all">
                            {email}
                        </p>

                    </div>

                    <div className="p-6 sm:p-8">

                        {error && (
                            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50/90 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2.5 text-sm text-emerald-700 bg-emerald-50/90 border border-emerald-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-center mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-5">

                            <div className="text-left">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    New Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-12 px-4 pr-12 rounded-2xl border border-slate-200 outline-none bg-white text-slate-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-all cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="text-left">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-12 px-4 pr-12 rounded-2xl border border-slate-200 outline-none bg-white text-slate-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-all cursor-pointer"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 disabled:opacity-70 rounded-2xl text-white font-bold transition-all duration-300 flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] cursor-pointer"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Changing...
                                    </span>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500 font-medium">
                                Back to{" "}
                                <Link
                                    to="/login"
                                    className="text-orange-600 hover:text-orange-700 font-bold hover:underline underline-offset-4 transition-all"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-6 font-medium tracking-wide">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default ChangePassword;