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
    <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-4 sm:px-6 py-6 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden transition-all duration-500 relative">

        {/* Ambient Warm Glow inside card */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-100/60 to-yellow-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* back button */}
        <div className="mb-4">
            <button
                onClick={onBack}
                className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 text-orange-600 font-semibold border border-orange-100/80 hover:border-orange-200 shadow-[0_2px_8px_rgba(249,115,22,0.04)] hover:bg-orange-100/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group'
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className='text-xs uppercase tracking-wider font-bold'>Back</span>
            </button>
        </div>

        {/* heading */}
        <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome to CollabFlow ✨
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium leading-relaxed">
                Select your role to continue setting up your workspace
            </p>
        </div>

        {/* role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

            {/* Admin card */}
            <button
                onClick={() => onSelect("admin")}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-3xl border border-orange-100 bg-white/80 hover:border-orange-500 hover:bg-orange-50/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.12)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 group-hover:from-orange-500 group-hover:to-yellow-500 flex items-center justify-center transition-all duration-500 shadow-sm">
                    <Shield size={22} className="text-orange-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Admin</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Create a new team, generate access codes, and manage workspace settings.
                    </p>
                </div>
                <ChevronRight size={16} className="absolute top-6 right-6 text-slate-300 group-hover:text-orange-500 transition-colors duration-300" />
            </button>

            {/* Member card */}
            <button
                onClick={() => onSelect("member")}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-3xl border border-orange-100 bg-white/80 hover:border-orange-500 hover:bg-orange-50/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.12)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 group-hover:from-orange-500 group-hover:to-yellow-500 flex items-center justify-center transition-all duration-500 shadow-sm">
                    <Users size={22} className="text-orange-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Team Member</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Join an existing team using a shared team code and start collaborating instantly.
                    </p>
                </div>
                <ChevronRight size={16} className="absolute top-6 right-6 text-slate-300 group-hover:text-orange-500 transition-colors duration-300" />
            </button>

        </div>

        {/* footer */}
        <p className="text-sm text-slate-500 text-center leading-relaxed font-medium">
            Already have an account?{" "}
            <Link
                to="/login"
                className="font-bold text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-all duration-300"
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
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-4 sm:px-6 py-6 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden transition-all duration-500 relative">

            {/* Ambient Warm Glow inside card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-100/60 to-yellow-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

            {/* back */}
            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 text-orange-600 font-semibold border border-orange-100/80 hover:border-orange-200 shadow-[0_2px_8px_rgba(249,115,22,0.04)] hover:bg-orange-100/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="text-xs uppercase tracking-wider font-bold">Back</span>
                </button>
            </div>

            {/* heading */}
            <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
                    <Shield size={13} />
                    Admin Account
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Create Your Team ✨
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Set up your admin account and initialize a workspace
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* profile */}
                <div className="flex justify-center pb-1">
                    <ProfilePhotoSelector
                        image={profilePic}
                        setImage={setProfilePic}
                        name={fullName}
                    />
                </div>

                {/* fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
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
                        placeholder="Enter your email"
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
                            placeholder="Unique code (e.g. DS-2026)"
                            type="text"
                        />
                        <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">
                            Share this code with your team members to let them join your space
                        </p>
                    </div>
                </div>

                {/* error */}
                {error && (
                    <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50/90 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 disabled:opacity-70 text-white font-bold py-4 rounded-3xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer tracking-wide"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Creating Team...</>
                    ) : (
                        "Create Team & Sign Up"
                    )}
                </button>

                <p className="text-sm text-slate-500 text-center leading-relaxed font-medium pt-1">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-all duration-300">
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
    const [teamName, setTeamName] = useState("");
    const [teamCodeLoading, setTeamCodeLoading] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const clearError = () => { if (error) setError(""); };

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
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-4 sm:px-6 py-6 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden transition-all duration-500 relative">

            {/* Ambient Warm Glow inside card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-100/60 to-yellow-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 text-orange-600 font-semibold border border-orange-100/80 hover:border-orange-200 shadow-[0_2px_8px_rgba(249,115,22,0.04)] hover:bg-orange-100/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="text-xs uppercase tracking-wider font-bold">Back</span>
                </button>
            </div>

            <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
                    <Users size={13} />
                    Team Member
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Join Your Team ✨
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Enter your team code to join an existing workspace
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="flex justify-center pb-1">
                    <ProfilePhotoSelector
                        image={profilePic}
                        setImage={setProfilePic}
                        name={fullName}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
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
                        placeholder="Enter your email"
                        type="email"
                    />
                    <Input
                        value={password}
                        onChange={({ target }) => { setPassword(target.value); clearError(); }}
                        label="Password"
                        placeholder="Min. 6 characters"
                        type="password"
                    />

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
                            placeholder="e.g. DS-2026"
                            type="text"
                        />

                        {teamCodeLoading && (
                            <div className="flex items-center gap-2 mt-1.5 ml-1">
                                <Loader2 size={13} className="animate-spin text-orange-500" />
                                <span className="text-xs text-orange-500 font-medium">Fetching team...</span>
                            </div>
                        )}

                        {teamName && !teamCodeLoading && (
                            <div className="flex items-center gap-2 mt-1.5 ml-1 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                                <Users size={13} className="text-orange-500 flex-shrink-0" />
                                <span className="text-xs text-orange-600 font-semibold">
                                    Team found: <span className="text-orange-700">{teamName}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2.5 bg-orange-50/80 border border-orange-100 rounded-2xl p-3.5 text-left">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-600 text-xs font-bold">i</span>
                    </div>
                    <p className="text-xs text-orange-700 font-medium leading-relaxed">
                        Ask your team admin for the team code. Entering a valid code will automatically add you to their workspace.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50/90 border border-red-200 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 disabled:opacity-70 text-white font-bold py-4 rounded-3xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer tracking-wide"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Joining Team...</>
                    ) : (
                        "Join Team & Sign Up"
                    )}
                </button>

                <p className="text-sm text-slate-500 text-center leading-relaxed font-medium pt-1">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-all duration-300">
                        Sign in
                    </Link>
                </p>

            </form>
        </div>
    );
};

// ─── Main SignUp Component ────────────────────────────────────────────────────
const SignUp = () => {

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