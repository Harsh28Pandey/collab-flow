import React, { useContext, useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import { validateEmail } from '../../utils/helper.js';
import ProfilePhotoSelector from '../../components/inputs/ProfilePhotoSelector.jsx';
import Input from '../../components/inputs/Input.jsx';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2
} from "lucide-react";

import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext.jsx';
import uploadImage from '../../utils/uploadImage.js';
import toast from 'react-hot-toast';

const SignUp = () => {

    const [profilePic, setProfilePic] = useState(null);

    const [fullName, setFullName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [adminInviteToken, setAdminInviteToken] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const { updateUser } = useContext(UserContext);

    const navigate = useNavigate();

    //* handle signup
    const handleSignUp = async (e) => {

        e.preventDefault();

        setError("");

        //* validations
        if (!fullName.trim()) {
            setError("Please enter full name");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter valid email");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {

            setLoading(true);

            let profileImageUrl = "";

            //* upload image
            if (profilePic) {

                const imgUploadRes =
                    await uploadImage(profilePic);

                profileImageUrl =
                    imgUploadRes?.imageUrl || "";
            }

            //* register api
            const response = await axiosInstance.post(
                API_PATHS.AUTH.REGISTER, {
                name: fullName,
                email,
                password,
                profileImageUrl,
                adminInviteToken,
            }
            );

            //* success
            if (response.data.token || response.data._id) {
                toast.success(
                    response.data.message || "Account created! Please verify your email"
                );

                localStorage.setItem("verifyEmail", email);
                localStorage.setItem("verifyRole", response.data.role);

                navigate("/verify-email");
            }

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <AuthLayout>

            <div className='w-full max-w-lg mx-auto flex flex-col justify-center relative px-1 sm:px-2 md:px-0 py-1'>

                {/* back button */}
                <div className="mb-4">

                    <button
                        onClick={() => navigate(-1)}
                        className='flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 active:scale-95 cursor-pointer'
                    >

                        <ArrowLeft size={18} />

                        <span className='text-sm font-semibold tracking-wide'>
                            Back
                        </span>

                    </button>
                </div>

                {/* heading */}
                <div className='mb-6'>

                    <h2 className='text-2xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight'>
                        Create Account ✨
                    </h2>

                    <p className='text-sm sm:text-base text-gray-500 mt-2 leading-relaxed'>
                        Sign up to continue with Collab Flow
                    </p>

                </div>

                {/* form */}
                <form
                    onSubmit={handleSignUp}
                    className='space-y-5'
                >

                    {/* profile */}
                    <div className='flex justify-center pb-1'>
                        <ProfilePhotoSelector
                            image={profilePic}
                            setImage={setProfilePic}
                            name={fullName}
                        />
                    </div>

                    {/* inputs */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                        <Input
                            value={fullName}
                            onChange={({ target }) => {
                                setFullName(target.value);

                                if (error) setError("");
                            }}
                            label="Full Name"
                            placeholder="Enter full name"
                            type='text'
                        />

                        <Input
                            value={email}
                            onChange={({ target }) => {
                                setEmail(target.value);

                                if (error) setError("");
                            }}
                            label="Email Address"
                            placeholder="Enter email"
                            type="email"
                        />

                        <Input
                            value={password}
                            onChange={({ target }) => {
                                setPassword(target.value);

                                if (error) setError("");
                            }}
                            label="Password"
                            placeholder="Enter password"
                            type="password"
                        />

                        <Input
                            value={adminInviteToken}
                            onChange={({ target }) =>
                                setAdminInviteToken(
                                    target.value
                                )
                            }
                            label="Admin Invite Token"
                            placeholder="7-Digit Token (Optional)"
                            type="text"
                        />

                    </div>

                    {/* error */}
                    {error && (
                        <div className='text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed'>
                            {error}
                        </div>
                    )}

                    {/* button */}
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.22)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.32)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer tracking-wide'
                    >

                        {loading ? (
                            <>
                                <Loader2 className='w-5 h-5 animate-spin' />
                                Creating Account...
                            </>
                        ) : (
                            "Sign Up"
                        )}

                    </button>

                    {/* footer */}
                    <p className='text-sm text-gray-600 text-center leading-relaxed'>

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className='font-semibold text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline transition-all duration-300'
                        >
                            Login
                        </Link>

                    </p>

                </form>
            </div>

        </AuthLayout>
    );
};

export default SignUp;