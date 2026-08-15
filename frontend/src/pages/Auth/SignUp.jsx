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
import { LuTerminal, LuShieldCheck } from "react-icons/lu";

// ─── Step 1: Role Selection ───────────────────────────────────────────────────
const RoleSelector = ({ onSelect, onBack }) => (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-2 sm:px-4 py-2 text-zinc-100">

        {/* back button */}
        <div className="mb-6">
            <button
                onClick={onBack}
                className='inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/60 text-cyan-300 font-semibold border border-white/5 hover:border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-zinc-800/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group'
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className='text-xs font-mono uppercase tracking-wider'>Back</span>
            </button>
        </div>

        {/* heading */}
        <div className="mb-8 text-left">
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <LuTerminal size={12} className="text-cyan-400" />
                <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                    Workspace Initialization
                </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Welcome to Collab Flow ✨
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 font-medium leading-relaxed">
                Select your role to continue setting up your workspace
            </p>
        </div>

        {/* role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

            {/* Admin card */}
            <button
                onClick={() => onSelect("admin")}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-3xl border border-white/10 bg-zinc-900/60 hover:border-cyan-500/50 hover:bg-zinc-900 shadow-lg hover:shadow-[0_12px_30px_rgba(56,189,248,0.15)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 group-hover:from-cyan-500 group-hover:to-blue-600 flex items-center justify-center transition-all duration-500 shadow-sm">
                    <Shield size={22} className="text-cyan-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-base mb-1">Admin</h3>
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        Create a new team, generate access codes, and manage workspace settings.
                    </p>
                </div>
                <ChevronRight size={16} className="absolute top-6 right-6 text-zinc-600 group-hover:text-cyan-400 transition-colors duration-300" />
            </button>

            {/* Member card */}
            <button
                onClick={() => onSelect("member")}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-3xl border border-white/10 bg-zinc-900/60 hover:border-purple-500/50 hover:bg-zinc-900 shadow-lg hover:shadow-[0_12px_30px_rgba(168,85,247,0.15)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/30 group-hover:from-purple-500 group-hover:to-indigo-600 flex items-center justify-center transition-all duration-500 shadow-sm">
                    <Users size={22} className="text-purple-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-base mb-1">Team Member</h3>
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        Join an existing team using a shared team code and start collaborating instantly.
                    </p>
                </div>
                <ChevronRight size={16} className="absolute top-6 right-6 text-zinc-600 group-hover:text-purple-400 transition-colors duration-300" />
            </button>

        </div>

        {/* footer */}
        <p className="text-sm text-zinc-400 text-center leading-relaxed font-medium">
            Already have an account?{" "}
            <Link
                to="/login"
                className="font-bold text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-all duration-300 font-mono"
            >
                Sign in
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
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-2 sm:px-4 py-2 text-zinc-100">

            {/* back */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/60 text-cyan-300 font-semibold border border-white/5 hover:border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-zinc-800/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="text-xs font-mono uppercase tracking-wider">Back</span>
                </button>
            </div>

            {/* heading */}
            <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-xs font-mono px-3.5 py-1.5 rounded-full mb-3">
                    <Shield size={13} />
                    Admin Account Setup
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Create Your Team ✨
                </h2>
                <p className="text-sm text-zinc-400 mt-1.5 font-medium leading-relaxed">
                    Set up your admin account and initialize a secure workspace
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left [&_input]:text-zinc-100 [&_input]:bg-zinc-900/80 [&_input]:border-white/10 [&_input]:placeholder:text-zinc-600 [&_label]:text-zinc-300">
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
                        <p className="text-xs text-zinc-400 mt-1.5 ml-1 font-mono">
                            Share this code with your team members to let them join your space
                        </p>
                    </div>
                </div>

                {/* error */}
                {error && (
                    <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* submit */}
                <div className="relative group cursor-pointer w-full mt-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-4 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin relative z-10 text-cyan-400" />
                                <span className="relative z-10 font-mono text-sm">Initializing Team...</span>
                            </>
                        ) : (
                            <span className="relative z-10 flex items-center gap-2 font-mono text-sm">
                                <LuShieldCheck size={16} className="text-cyan-400" /> Create Team & Sign Up
                            </span>
                        )}
                    </button>
                </div>

                <p className="text-sm text-zinc-400 text-center leading-relaxed font-medium pt-2">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-all duration-300 font-mono">
                        Sign in
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
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-2 sm:px-4 py-2 text-zinc-100">

            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/60 text-cyan-300 font-semibold border border-white/5 hover:border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-zinc-800/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="text-xs font-mono uppercase tracking-wider">Back</span>
                </button>
            </div>

            <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono px-3.5 py-1.5 rounded-full mb-3">
                    <Users size={13} />
                    Team Member Access
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Join Your Team ✨
                </h2>
                <p className="text-sm text-zinc-400 mt-1.5 font-medium leading-relaxed">
                    Enter your team code to join an existing secure workspace
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left [&_input]:text-zinc-100 [&_input]:bg-zinc-900/80 [&_input]:border-white/10 [&_input]:placeholder:text-zinc-600 [&_label]:text-zinc-300">
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
                                <Loader2 size={13} className="animate-spin text-cyan-400" />
                                <span className="text-xs text-cyan-400 font-mono">Fetching team...</span>
                            </div>
                        )}

                        {teamName && !teamCodeLoading && (
                            <div className="flex items-center gap-2 mt-1.5 ml-1 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2">
                                <Users size={13} className="text-cyan-400 flex-shrink-0" />
                                <span className="text-xs text-cyan-300 font-mono font-semibold">
                                    Team found: <span className="text-white">{teamName}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2.5 bg-zinc-900/60 border border-white/5 rounded-2xl p-3.5 text-left">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-400 text-xs font-bold">i</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        Ask your team admin for the team code. Entering a valid code will automatically add you to their workspace.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl shadow-sm leading-relaxed font-medium text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="relative group cursor-pointer w-full mt-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-4 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer tracking-wide overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin relative z-10 text-cyan-400" />
                                <span className="relative z-10 font-mono text-sm">Joining Team...</span>
                            </>
                        ) : (
                            <span className="relative z-10 flex items-center gap-2 font-mono text-sm">
                                <LuShieldCheck size={16} className="text-cyan-400" /> Join Team & Sign Up
                            </span>
                        )}
                    </button>
                </div>

                <p className="text-sm text-zinc-400 text-center leading-relaxed font-medium pt-1">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-all duration-300 font-mono">
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