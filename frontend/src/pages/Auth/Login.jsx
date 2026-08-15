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
import { LuTerminal, LuShieldCheck } from "react-icons/lu";

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
            {/* Clean container without duplicate card wrapper */}
            <div className='w-full max-w-md mx-auto flex flex-col justify-center relative px-2 sm:px-4 py-2 text-zinc-100'>

                {/* 🔙 BACK BUTTON */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1) || navigate("/")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/60 text-cyan-300 font-semibold border border-white/5 hover:border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-zinc-800/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                    >
                        <ArrowLeft
                            size={16}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                        />
                        <span className="text-xs font-mono tracking-wider uppercase">
                            Back
                        </span>
                    </button>
                </div>

                {/* heading */}
                <div className='mb-8 text-left'>
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <LuTerminal size={12} className="text-cyan-400" />
                        <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                            Secure Edge Auth v2.0
                        </span>
                    </div>
                    <h3 className='text-3xl font-extrabold text-white tracking-tight leading-tight'>
                        Welcome Back 👋
                    </h3>
                    <p className='text-sm sm:text-base text-zinc-400 mt-2 font-medium leading-relaxed'>
                        Please enter your details to access your secure workspace
                    </p>
                </div>

                {/* form */}
                <form onSubmit={handleLogin} className='space-y-4'>

                    <div className="text-left">
                        <Input
                            value={email}
                            onChange={handleEmailChange}
                            label="Email Address"
                            placeholder="Enter your email"
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
                            className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 font-bold transition-all duration-300 font-mono"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* error */}
                    {error && (
                        <div className='flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl shadow-sm leading-relaxed animate-fadeIn font-medium text-left'>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* button with futuristic glow */}
                    <div className="relative group cursor-pointer w-full mt-2">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                        <button
                            type='submit'
                            disabled={loading}
                            className="relative w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-4 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {
                                loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin relative z-10 text-cyan-400" />
                                        <span className="relative z-10 font-mono text-sm">Authenticating...</span>
                                    </>
                                ) : (
                                    <span className="relative z-10 flex items-center gap-2 font-mono text-sm">
                                        <LuShieldCheck size={16} className="text-cyan-400" /> Sign In to Workspace
                                    </span>
                                )
                            }
                        </button>
                    </div>

                    {/* footer */}
                    <p className='text-sm text-zinc-400 text-center leading-relaxed font-medium pt-3'>
                        Don't have an account?{" "}
                        <Link
                            className="font-bold text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-all duration-300 font-mono"
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