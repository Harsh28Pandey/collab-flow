import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import Input from '../../components/inputs/Input.jsx';
import { validateEmail } from '../../utils/helper.js';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext.jsx';

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) setError("");
    };

    //* handle login form submit
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!password) {
            setError("Please enter the password");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email,
                password
            });

            const { token, role } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                updateUser(response.data);
                toast.success("Login successful");

                if (role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/user/dashboard");
                }
            }

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Login failed";

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className='w-full max-w-md mx-auto flex flex-col justify-center relative px-4 sm:px-6 py-6 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden transition-all duration-500'>

                {/* Ambient Warm Glow inside card */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-100/60 to-yellow-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

                {/* 🔙 BACK BUTTON */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1) || navigate("/")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 text-orange-600 font-semibold border border-orange-100/80 hover:border-orange-200 shadow-[0_2px_8px_rgba(249,115,22,0.04)] hover:bg-orange-100/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                    >
                        <ArrowLeft
                            size={16}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                        />
                        <span className="text-xs tracking-wider uppercase">
                            Back
                        </span>
                    </button>
                </div>

                {/* heading */}
                <div className='mb-8 text-left'>
                    <h3 className='text-3xl font-extrabold text-slate-900 tracking-tight leading-tight'>
                        Welcome Back 👋
                    </h3>
                    <p className='text-sm sm:text-base text-slate-500 mt-2 font-medium leading-relaxed'>
                        Please enter your details to access your workspace
                    </p>
                </div>

                {/* form */}
                <form onSubmit={handleLogin} className='space-y-4'>

                    <div className="text-left">
                        <Input
                            value={email}
                            onChange={handleEmailChange}
                            label="Email Address"
                            placeholder="name@example.com"
                            type="email"
                        />
                    </div>

                    <div className="text-left">
                        <Input
                            value={password}
                            onChange={handlePasswordChange}
                            label="Password"
                            placeholder="••••••••"
                            type="password"
                        />
                    </div>

                    {/* forgot password */}
                    <div className="flex justify-end pt-1">
                        <Link
                            to="/forgot-password"
                            className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 font-bold transition-all duration-300"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* error */}
                    {error && (
                        <div className='flex items-center gap-2.5 text-sm text-red-600 bg-red-50/90 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed animate-fadeIn font-medium text-left'>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* button */}
                    <button
                        type='submit'
                        disabled={loading}
                        className="w-full mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-white font-bold py-4 rounded-3xl shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide"
                    >
                        {
                            loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )
                        }
                    </button>

                    {/* footer */}
                    <p className='text-sm text-slate-500 text-center leading-relaxed font-medium pt-2'>
                        Don't have an account?{" "}
                        <Link
                            className="font-bold text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-all duration-300"
                            to="/signup"
                        >
                            Sign Up
                        </Link>
                    </p>

                </form>

            </div>
        </AuthLayout>
    )
}

export default Login;