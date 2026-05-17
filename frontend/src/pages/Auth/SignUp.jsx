import React, { useContext, useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import { validateEmail } from '../../utils/helper.js';
import ProfilePhotoSelector from '../../components/inputs/ProfilePhotoSelector.jsx';
import Input from '../../components/inputs/Input.jsx';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    Shield,
    Users,
    ChevronRight,
} from "lucide-react";

import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext.jsx';
import uploadImage from '../../utils/uploadImage.js';
import toast from 'react-hot-toast';

// ─── Step 1: Role Selection ───────────────────────────────────────────────────
const RoleSelector = ({ onSelect, onBack }) => (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-1 sm:px-2 md:px-0 py-2">

        {/* back button */}
        <div className="mb-4">
            <button
                onClick={onBack}
                className='flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 active:scale-95 cursor-pointer'
            >
                <ArrowLeft size={18} />
                <span className='text-sm font-semibold tracking-wide'>Back</span>
            </button>
        </div>

        {/* heading */}
        <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Welcome to CollabFlow ✨
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 leading-relaxed">
                Select your role to continue
            </p>
        </div>

        {/* role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

            {/* Admin card */}
            <button
                onClick={() => onSelect("admin")}
                className="group relative flex flex-col items-start gap-3 p-6 rounded-2xl border-2 border-blue-100 bg-white hover:border-blue-500 hover:bg-blue-50 shadow-sm hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                    <Shield size={22} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">Admin</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Create a new team, generate access codes, and manage your workspace.
                    </p>
                </div>
                <ChevronRight size={16} className="absolute top-5 right-5 text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
            </button>

            {/* Member card */}
            <button
                onClick={() => onSelect("member")}
                className="group relative flex flex-col items-start gap-3 p-6 rounded-2xl border-2 border-blue-100 bg-white hover:border-blue-500 hover:bg-blue-50 shadow-sm hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                    <Users size={22} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">Team Member</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Join an existing team using a team code and start collaborating.
                    </p>
                </div>
                <ChevronRight size={16} className="absolute top-5 right-5 text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
            </button>

        </div>

        {/* footer */}
        <p className="text-sm text-gray-600 text-center leading-relaxed">
            Already have an account?{" "}
            <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline transition-all duration-300"
            >
                Login
            </Link>
        </p>

    </div>
);

// ─── Step 2: Admin Form ───────────────────────────────────────────────────────
const AdminForm = ({ onBack }) => {

    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [teamName, setTeamName] = useState("");
    const [teamCode, setTeamCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const clearError = () => { if (error) setError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim()) return setError("Please enter full name");
        if (!validateEmail(email)) return setError("Please enter a valid email");
        if (password.length < 6) return setError("Password must be at least 6 characters");
        if (!teamName.trim()) return setError("Please enter your team name");
        if (!teamCode.trim()) return setError("Please enter a team code");

        try {
            setLoading(true);

            let profileImageUrl = "";
            if (profilePic) {
                const imgRes = await uploadImage(profilePic);
                profileImageUrl = imgRes?.imageUrl || "";
            }

            const response = await axiosInstance.post(
                API_PATHS.AUTH.REGISTER,
                {
                    name: fullName,
                    email,
                    password,
                    profileImageUrl,
                    role: "admin",
                    teamName,
                    teamCode,
                }
            );

            if (response.data.token || response.data._id) {
                toast.success(response.data.message || "Account created! Please verify your email");
                localStorage.setItem("verifyEmail", email);
                localStorage.setItem("verifyRole", response.data.role || "admin");
                navigate("/verify-email");
            }

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-1 sm:px-2 md:px-0 py-1">

            {/* back */}
            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-semibold tracking-wide">Back</span>
                </button>
            </div>

            {/* heading */}
            <div className="mb-5">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                    <Shield size={13} />
                    Admin Account
                </div>
                <h2 className="text-2xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    Create Your Team ✨
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Set up your admin account and create a team
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* profile */}
                <div className="flex justify-center pb-1">
                    <ProfilePhotoSelector
                        image={profilePic}
                        setImage={setProfilePic}
                        name={fullName}
                    />
                </div>

                {/* fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        value={fullName}
                        onChange={({ target }) => { setFullName(target.value); clearError(); }}
                        label="Full Name"
                        placeholder="Enter full name"
                        type="text"
                    />
                    <Input
                        value={email}
                        onChange={({ target }) => { setEmail(target.value); clearError(); }}
                        label="Email Address"
                        placeholder="Enter email"
                        type="email"
                    />
                    <Input
                        value={password}
                        onChange={({ target }) => { setPassword(target.value); clearError(); }}
                        label="Password"
                        placeholder="Min. 6 characters"
                        type="password"
                    />
                    <Input
                        value={teamName}
                        onChange={({ target }) => { setTeamName(target.value); clearError(); }}
                        label="Team Name"
                        placeholder="e.g. Design Squad"
                        type="text"
                    />
                    <div className="md:col-span-2">
                        <Input
                            value={teamCode}
                            onChange={({ target }) => { setTeamCode(target.value); clearError(); }}
                            label="Team Code"
                            placeholder="Create a unique team code (e.g. DS-2025)"
                            type="text"
                        />
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">
                            Share this code with your team members to let them join
                        </p>
                    </div>
                </div>

                {/* error */}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed">
                        {error}
                    </div>
                )}

                {/* submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.22)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.32)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer tracking-wide"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Creating Team...</>
                    ) : (
                        "Create Team & Sign Up"
                    )}
                </button>

                <p className="text-sm text-gray-600 text-center leading-relaxed">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline transition-all duration-300">
                        Login
                    </Link>
                </p>

            </form>
        </div>
    );
};

// ─── Step 2: Member Form ──────────────────────────────────────────────────────
const MemberForm = ({ onBack }) => {

    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [teamCode, setTeamCode] = useState("");
    const [teamName, setTeamName] = useState("");           // ✅ ADD
    const [teamCodeLoading, setTeamCodeLoading] = useState(false); // ✅ ADD
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const clearError = () => { if (error) setError(""); };

    // ✅ ADD - teamCode se team name fetch karo
    const fetchTeamName = async (code) => {
        if (!code.trim()) return;
        try {
            setTeamCodeLoading(true);
            const res = await axiosInstance.get(API_PATHS.AUTH.GET_TEAM_BY_CODE(code));
            if (res.data.success) {
                setTeamName(res.data.teamName);
                setError("");
            }
        } catch (err) {
            setTeamName("");
            setError("Invalid team code, no team found");
        } finally {
            setTeamCodeLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim()) return setError("Please enter full name");
        if (!validateEmail(email)) return setError("Please enter a valid email");
        if (password.length < 6) return setError("Password must be at least 6 characters");
        if (!teamCode.trim()) return setError("Please enter the team code");

        try {
            setLoading(true);

            let profileImageUrl = "";
            if (profilePic) {
                const imgRes = await uploadImage(profilePic);
                profileImageUrl = imgRes?.imageUrl || "";
            }

            const response = await axiosInstance.post(
                API_PATHS.AUTH.REGISTER,
                {
                    name: fullName,
                    email,
                    password,
                    profileImageUrl,
                    role: "member",
                    teamCode,
                }
            );

            if (response.data.token || response.data._id) {
                toast.success(response.data.message || "Account created! Please verify your email");
                localStorage.setItem("verifyEmail", email);
                localStorage.setItem("verifyRole", response.data.role || "member");
                navigate("/verify-email");
            }

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong. Check your team code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-1 sm:px-2 md:px-0 py-1">

            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-semibold tracking-wide">Back</span>
                </button>
            </div>

            <div className="mb-5">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                    <Users size={13} />
                    Team Member
                </div>
                <h2 className="text-2xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    Join Your Team ✨
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Enter your team code to join an existing workspace
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                <div className="flex justify-center pb-1">
                    <ProfilePhotoSelector
                        image={profilePic}
                        setImage={setProfilePic}
                        name={fullName}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        value={fullName}
                        onChange={({ target }) => { setFullName(target.value); clearError(); }}
                        label="Full Name"
                        placeholder="Enter full name"
                        type="text"
                    />
                    <Input
                        value={email}
                        onChange={({ target }) => { setEmail(target.value); clearError(); }}
                        label="Email Address"
                        placeholder="Enter email"
                        type="email"
                    />
                    <Input
                        value={password}
                        onChange={({ target }) => { setPassword(target.value); clearError(); }}
                        label="Password"
                        placeholder="Min. 6 characters"
                        type="password"
                    />

                    {/* ✅ Team Code with fetch */}
                    <div>
                        <Input
                            value={teamCode}
                            onChange={({ target }) => {
                                setTeamCode(target.value);
                                setTeamName("");
                                clearError();
                            }}
                            onBlur={() => fetchTeamName(teamCode)}
                            label="Team Code"
                            placeholder="Team code (e.g. DS-2025)"
                            type="text"
                        />

                        {teamCodeLoading && (
                            <div className="flex items-center gap-2 mt-2 ml-1">
                                <Loader2 size={13} className="animate-spin text-blue-500" />
                                <span className="text-xs text-blue-500">Fetching team...</span>
                            </div>
                        )}

                        {teamName && !teamCodeLoading && (
                            <div className="flex items-center gap-2 mt-2 ml-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                                <Users size={13} className="text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-blue-600 font-semibold">
                                    Team found: <span className="text-blue-700">{teamName}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        Ask your team admin for the team code. Entering a valid code will automatically add you to their workspace.
                    </p>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.22)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.32)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer tracking-wide"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Joining Team...</>
                    ) : (
                        "Join Team & Sign Up"
                    )}
                </button>

                <p className="text-sm text-gray-600 text-center leading-relaxed">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline transition-all duration-300">
                        Login
                    </Link>
                </p>

            </form>
        </div>
    );
};

// ─── Main SignUp Component ────────────────────────────────────────────────────
const SignUp = () => {

    // "select" | "admin" | "member"
    const [step, setStep] = useState("select");
    const navigate = useNavigate();

    return (
        <AuthLayout>
            {step === "select" && (
                <RoleSelector onSelect={(role) => setStep(role)} onBack={() => navigate(-1)} />
            )}
            {step === "admin" && (
                <AdminForm onBack={() => setStep("select")} />
            )}
            {step === "member" && (
                <MemberForm onBack={() => setStep("select")} />
            )}
        </AuthLayout>
    );
};

export default SignUp;