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
                `http://localhost:8000/api/auth/change-password/${email}`,
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">

                    {/* Top */}
                    <div className="bg-blue-600 px-8 py-8 text-center">

                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LockKeyhole className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Change Password
                        </h1>

                        <p className="text-blue-100 text-sm mt-2 leading-6">
                            Create a new secure password
                        </p>

                        <p className="text-white text-sm font-medium mt-2 break-all">
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
                        {success && (
                            <div className="bg-blue-100 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3 mb-5 text-center">
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={handleChangePassword}
                            className="space-y-5"
                        >

                            {/* New Password */}
                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full h-12 px-4 pr-12
                                            rounded-xl border border-gray-300
                                            outline-none
                                            focus:ring-4 focus:ring-blue-100
                                            focus:border-blue-500
                                            transition-all
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="
                                            absolute top-1/2 right-4
                                            -translate-y-1/2
                                            text-gray-500 cursor-pointer
                                        "
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full h-12 px-4 pr-12
                                            rounded-xl border border-gray-300
                                            outline-none
                                            focus:ring-4 focus:ring-blue-100
                                            focus:border-blue-500
                                            transition-all
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="
                                            absolute top-1/2 right-4
                                            -translate-y-1/2
                                            text-gray-500 cursor-pointer
                                        "
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
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
                                        Changing...
                                    </span>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-sm text-gray-600 mt-6">

                            Back to{" "}

                            <Link
                                to="/login"
                                className="text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                                Login
                            </Link>
                        </p>
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

export default ChangePassword;