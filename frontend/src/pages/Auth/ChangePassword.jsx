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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100 flex items-center justify-center px-4 py-8">

            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">

                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(37,99,235,0.12)] rounded-3xl overflow-hidden border border-blue-100">

                    <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 sm:px-8 py-8 text-center">

                        <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">

                            <LockKeyhole className="w-8 h-8 text-white" />

                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Change Password
                        </h1>

                        <p className="text-blue-100 text-sm sm:text-base mt-3 leading-6">
                            Create a new secure password
                        </p>

                        <p className="text-white text-sm font-medium mt-3 break-all">
                            {email}
                        </p>

                    </div>

                    <div className="p-6 sm:p-8">

                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-blue-100 border border-blue-200 text-blue-700 text-sm rounded-2xl px-4 py-3 mb-5 text-center">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-5">

                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-300 outline-none bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-all cursor-pointer"
                                    >

                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}

                                    </button>

                                </div>
                            </div>

                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-300 outline-none bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-all cursor-pointer"
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
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-70 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-200 cursor-pointer"
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

                        <p className="text-center text-sm text-gray-600 mt-6">

                            Back to{" "}

                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
                            >
                                Login
                            </Link>

                        </p>

                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    © 2026 Collab Flow. All rights reserved.
                </p>

            </div>
        </div>
    );
};

export default ChangePassword;