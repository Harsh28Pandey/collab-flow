import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
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

            // toast.error(message);

        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className='w-full max-w-lg mx-auto flex flex-col justify-center relative px-1 sm:px-2 md:px-0 py-1'>

                {/* 🔙 BACK BUTTON */}
                <div className="mb-4">

                    <button
                        onClick={() => navigate(-1) || navigate("/")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:bg-blue-100 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                    >
                        <ArrowLeft
                            size={18}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                        />

                        <span className="text-sm tracking-wide">
                            Back
                        </span>

                    </button>
                </div>

                {/* heading */}
                <div className='mb-6'>

                    <h3 className='text-2xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight'>
                        Welcome Back 👋
                    </h3>

                    <p className='text-sm sm:text-base text-gray-500 mt-2 leading-relaxed'>
                        Please enter your details to log in
                    </p>

                </div>

                {/* form */}
                <form onSubmit={handleLogin} className='space-y-5'>

                    <Input
                        value={email}
                        onChange={handleEmailChange}
                        label="Email Address"
                        placeholder="Enter your email address"
                        type="email"
                    />

                    <Input
                        value={password}
                        onChange={handlePasswordChange}
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                    />

                    {/* forgot password */}
                    <div className="flex justify-end -mt-1">

                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 font-semibold transition-all duration-300"
                        >
                            Forgot Password?
                        </Link>

                    </div>

                    {/* error */}
                    {error && (
                        <p className='flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed animate-fade-in'>
                            {error}
                        </p>
                    )}

                    {/* button */}
                    <button
                        type='submit'
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-semibold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.22)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.32)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide"
                    >

                        {
                            loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )
                        }

                    </button>

                    {/* footer */}
                    <p className='text-sm text-gray-600 text-center leading-relaxed'>

                        Don't have an account?{" "}

                        <Link
                            className="font-semibold text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline transition-all duration-300"
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