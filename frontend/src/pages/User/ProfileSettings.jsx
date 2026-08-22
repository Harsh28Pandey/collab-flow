import React, { useEffect, useState } from "react";
import {
    Camera, Loader2, Lock, Mail, Save, ShieldCheck,
    User, Users, KeyRound, CheckCircle2, XCircle, FileText, Code2, Briefcase,
    ShieldQuestion, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const GithubIcon = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.2.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
);

const isValidImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("blob:")) return false;
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
    return false;
};

const ProfileSettings = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageVisible, setPageVisible] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [teamName, setTeamName] = useState("");
    const [teamCode, setTeamCode] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState(""); // comma-separated string for input
    const [experienceLevel, setExperienceLevel] = useState("Beginner");
    const [githubUrl, setGithubUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");

    const [savedImageUrl, setSavedImageUrl] = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const [newImageFile, setNewImageFile] = useState(null);

    const [error, setError] = useState("");

    const [toast, setToast] = useState({
        show: false,
        type: "success",
        message: ""
    });

    const showToast = (type, message) => {
        setToast({
            show: true,
            type,
            message
        });

        setTimeout(() => {
            setToast({
                show: false,
                type: "success",
                message: ""
            });
        }, 3000);
    };

    // ==========================================
    // FETCH PROFILE
    // ==========================================
    const fetchProfile = async () => {

        try {

            setLoading(true);
            setPageVisible(false);
            setError("");

            const res = await axiosInstance.get(
                API_PATHS.SETTINGS.GET_SETTINGS
            );

            const user =
                res.data?.data ||
                res.data?.user ||
                res.data;

            setTimeout(() => {

                setName(user?.name || "");
                setEmail(user?.email || "");
                setTeamName(user?.teamName || "");
                setTeamCode(user?.teamCode || "");
                setBio(user?.bio || "");
                setSkills(Array.isArray(user?.skills) ? user.skills.join(", ") : "");
                setExperienceLevel(user?.experienceLevel || "Beginner");
                setGithubUrl(user?.githubUrl || "");
                setLinkedinUrl(user?.linkedinUrl || "");

                const cleanUrl = isValidImageUrl(
                    user?.profileImageUrl
                )
                    ? user.profileImageUrl
                    : "";

                setSavedImageUrl(cleanUrl);
                setPreviewImage(cleanUrl);

                setNewImageFile(null);

                setLoading(false);

                setTimeout(() => {
                    setPageVisible(true);
                }, 100);

            }, 1200);

        } catch (error) {

            setError(
                error?.response?.data?.message ||
                "Failed to fetch profile"
            );

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // ==========================================
    // HANDLE IMAGE CHANGE
    // ==========================================
    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        // validate type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            showToast(
                "error",
                "Only jpg, jpeg, png and webp allowed"
            );
            return;
        }

        // validate size
        if (file.size > 5 * 1024 * 1024) {
            showToast(
                "error",
                "Image size must be less than 5MB"
            );
            return;
        }

        setNewImageFile(file);

        // local preview only
        const localPreview = URL.createObjectURL(file);

        setPreviewImage(localPreview);
    };

    // ==========================================
    // UPDATE PROFILE
    // ==========================================
    const updateProfile = async () => {

        try {

            setSaving(true);
            setError("");

            let finalImageUrl = savedImageUrl;

            // STEP 1: Upload image to backend
            if (newImageFile) {

                const imageFormData = new FormData();

                imageFormData.append(
                    "image",
                    newImageFile
                );

                const uploadRes = await axiosInstance.post(
                    "/api/auth/upload-image",
                    imageFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                finalImageUrl =
                    uploadRes.data?.imageUrl || "";
            }

            // STEP 2: Update profile
            const res = await axiosInstance.put(
                API_PATHS.SETTINGS.UPDATE_SETTINGS,
                {
                    name,
                    profileImageUrl: finalImageUrl,
                    bio,
                    skills: skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    experienceLevel,
                    githubUrl,
                    linkedinUrl,
                }
            );

            // STEP 3: Update local states
            setSavedImageUrl(finalImageUrl);
            setPreviewImage(finalImageUrl);

            setNewImageFile(null);

            showToast(
                "success",
                res.data?.message ||
                "Profile updated successfully"
            );

        } catch (error) {

            console.log(error);

            showToast(
                "error",
                error?.response?.data?.message ||
                "Failed to update profile"
            );

        } finally {

            setSaving(false);
        }
    };

    const sendOtp = () => {
        navigate("/forgot-password", {
            state: { email }
        });
    };

    const Skeleton = ({ className }) => (
        <div className={`relative overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl ${className}`}>
            <div className="absolute inset-0 skeleton-shimmer" />
        </div>
    );

    const showPreview =
        previewImage &&
        (
            previewImage.startsWith("blob:") ||
            isValidImageUrl(previewImage)
        );

    return (
        <DashboardLayout activeMenu="Profile Settings">

            {/* TOAST */}
            {toast.show && (
                <div className="fixed top-5 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none toast-enter">
                    <div className={`pointer-events-auto min-w-[280px] max-w-[420px] w-full px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 border backdrop-blur-xl ${toast.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                    >
                        {toast.type === "success"
                            ? <CheckCircle2 size={22} className="shrink-0 stroke-[2.5]" />
                            : <XCircle size={22} className="shrink-0 stroke-[2.5]" />
                        }

                        <p className="text-sm font-mono font-bold leading-tight tracking-wide">
                            {toast.message}
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-2">

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Profile Settings
                        </h1>

                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                            Manage your account settings and preferences.
                        </p>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-inner">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-inner shrink-0">
                            <ShieldCheck
                                size={20}
                                className="text-cyan-400 stroke-[2.5]"
                            />
                        </div>

                        <div>
                            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                                Account Status
                            </p>

                            <h3 className="text-sm font-mono font-black text-cyan-400 mt-0.5">
                                Secure & Active
                            </h3>
                        </div>
                    </div>
                </div>

                {loading ? (

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 min-h-[560px] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                            <div className="flex flex-col items-center pt-4">
                                <Skeleton className="h-32 w-32 !rounded-full animate-pulse" />
                                <Skeleton className="h-6 w-40 mt-6 animate-pulse" />
                                <Skeleton className="h-4 w-52 mt-3 animate-pulse" />

                                <div className="w-full mt-10 space-y-4">
                                    <Skeleton className="h-20 w-full animate-pulse" />
                                    <Skeleton className="h-20 w-full animate-pulse" />
                                    <Skeleton className="h-24 w-full animate-pulse" />
                                    <Skeleton className="h-16 w-full animate-pulse" />
                                    <Skeleton className="h-16 w-full animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-2 space-y-6">

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 min-h-[380px] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-3">
                                        <Skeleton className="h-6 w-52 animate-pulse" />
                                        <Skeleton className="h-4 w-40 animate-pulse" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-xl animate-pulse" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Skeleton className="h-14 w-full animate-pulse" />
                                    <Skeleton className="h-14 w-full animate-pulse" />
                                    <Skeleton className="h-14 w-full animate-pulse" />
                                    <Skeleton className="h-14 w-full animate-pulse" />
                                </div>

                                <div className="flex justify-end mt-8 border-t border-white/5 pt-6">
                                    <Skeleton className="h-12 w-40 rounded-2xl animate-pulse" />
                                </div>
                            </div>

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 min-h-[340px] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-3">
                                        <Skeleton className="h-6 w-52 animate-pulse" />
                                        <Skeleton className="h-4 w-40 animate-pulse" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-xl animate-pulse" />
                                </div>
                                <div className="space-y-5">
                                    <Skeleton className="h-20 w-full animate-pulse" />
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Skeleton className="h-14 w-full animate-pulse" />
                                        <Skeleton className="h-14 w-full animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-3">
                                        <Skeleton className="h-6 w-52 animate-pulse" />
                                        <Skeleton className="h-4 w-40 animate-pulse" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-xl animate-pulse" />
                                </div>
                                <Skeleton className="h-12 w-44 rounded-2xl animate-pulse" />
                            </div>
                        </div>
                    </div>

                ) : (

                    <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 items-start transition-all duration-500 ease-out ${pageVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                        }`}
                    >

                        {/* LEFT PANEL: PROFILE OVERVIEW */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden h-fit">

                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

                            <div className="flex flex-col items-center text-center relative z-10 pt-2">

                                <div className="relative group">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />

                                    {showPreview ? (
                                        <img
                                            src={previewImage}
                                            alt="profile"
                                            className="relative h-32 w-32 rounded-full object-cover border-[3px] border-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.2)] z-10"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display = "flex";
                                            }}
                                        />
                                    ) : null}

                                    {/* FALLBACK AVATAR */}
                                    <div
                                        className="relative h-32 w-32 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-zinc-950 items-center justify-center text-4xl font-black border-[3px] border-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.2)] z-10"
                                        style={{
                                            display: showPreview
                                                ? "none"
                                                : "flex"
                                        }}
                                    >
                                        {name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>

                                    <label className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-white flex items-center justify-center shadow-lg border-2 border-zinc-950 cursor-pointer transition-all z-20 hover:scale-105 active:scale-95">
                                        <Camera size={16} className="stroke-[2.5]" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>

                                {newImageFile && (
                                    <p className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400 mt-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg tracking-wide">
                                        ✓ New image selected — Update to save
                                    </p>
                                )}

                                <h2 className="mt-5 text-xl sm:text-2xl font-black text-white tracking-wide">
                                    {name || "No Name"}
                                </h2>

                                <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1 break-all">
                                    {email || "No Email"}
                                </p>

                                <div className="w-full mt-8 space-y-3">

                                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                            Team Name
                                        </p>
                                        <h4 className="text-sm sm:text-base font-mono font-bold text-white break-all">
                                            {teamName || "No Team"}
                                        </h4>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                            Team Code
                                        </p>
                                        <h4 className="text-sm sm:text-base font-mono font-bold text-cyan-400 tracking-wider break-all">
                                            {teamCode || "No Code"}
                                        </h4>
                                    </div>

                                </div>
                            </div>

                            {/* ===== FILLS VACANT SPACE BELOW TEAM CODE ===== */}
                            <div className="w-full mt-4 space-y-3 relative z-10">

                                {/* BIO PREVIEW */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                        About / Bio
                                    </p>
                                    <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed break-words">
                                        {bio || "No bio added yet."}
                                    </p>
                                </div>

                                {/* EXPERIENCE LEVEL */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                        Experience Level
                                    </p>
                                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-mono font-bold">
                                        {experienceLevel || "Beginner"}
                                    </span>
                                </div>

                                {/* SKILLS */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                        Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {skills
                                            ? skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs font-mono font-bold break-all"
                                                >
                                                    {skill}
                                                </span>
                                            ))
                                            : (
                                                <span className="text-xs sm:text-sm font-mono text-zinc-500">
                                                    No skills added yet.
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>

                                {/* SOCIAL LINKS */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                        Social Links
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">

                                        {githubUrl ? (
                                            <a
                                                href={githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-10 w-10 rounded-xl bg-zinc-800/60 border border-white/10 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all shrink-0"
                                            >
                                                <GithubIcon size={18} />
                                            </a>
                                        ) : (
                                            <div className="h-10 w-10 rounded-xl bg-zinc-800/30 border border-white/5 flex items-center justify-center text-zinc-600 shrink-0">
                                                <GithubIcon size={18} />
                                            </div>
                                        )}

                                        {linkedinUrl ? (
                                            <a
                                                href={linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-all shrink-0"
                                            >
                                                <LinkedinIcon size={18} />
                                            </a>
                                        ) : (
                                            <div className="h-10 w-10 rounded-xl bg-zinc-800/30 border border-white/5 flex items-center justify-center text-zinc-600 shrink-0">
                                                <LinkedinIcon size={18} />
                                            </div>
                                        )}

                                        {!githubUrl && !linkedinUrl && (
                                            <p className="text-xs sm:text-sm font-mono text-zinc-500">
                                                No links added yet.
                                            </p>
                                        )}

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT PANEL: EDIT FORMS */}
                        <div className="xl:col-span-2 space-y-6">

                            {/* SECTION 1: PROFILE INFO */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                                <div className="flex items-start sm:items-center justify-between mb-8 pb-5 border-b border-white/5 gap-4">

                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                            Profile Information
                                        </h2>

                                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                            Update your personal and team details.
                                        </p>
                                    </div>

                                    <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <User
                                            size={20}
                                            className="text-cyan-400 stroke-[2.5]"
                                        />
                                    </div>

                                </div>

                                <div className="grid md:grid-cols-2 gap-6">

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Name
                                        </label>

                                        <div className="relative">
                                            <User
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10"
                                            />

                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Team Name
                                        </label>

                                        <div className="relative">
                                            <Users
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 z-10"
                                            />

                                            <input
                                                type="text"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                                                placeholder="Enter team name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Email <span className="text-zinc-600 font-normal normal-case">(Read-only)</span>
                                        </label>

                                        <div className="relative opacity-60">
                                            <Mail
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10"
                                            />

                                            <input
                                                type="text"
                                                value={email}
                                                disabled
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/5 bg-zinc-900/50 text-zinc-400 text-sm font-mono cursor-not-allowed shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Team Code <span className="text-zinc-600 font-normal normal-case">(Read-only)</span>
                                        </label>

                                        <div className="relative opacity-60">
                                            <KeyRound
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10"
                                            />

                                            <input
                                                type="text"
                                                value={teamCode}
                                                disabled
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/5 bg-zinc-900/50 text-zinc-400 text-sm font-mono cursor-not-allowed shadow-inner"
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="flex justify-end mt-8 pt-6 border-t border-white/5">

                                    <div className="relative group cursor-pointer w-full sm:w-auto">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                                        <button
                                            onClick={updateProfile}
                                            disabled={saving}
                                            className="relative w-full sm:w-auto h-12 px-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 shadow-lg cursor-pointer"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin text-cyan-400" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} className="text-cyan-400 stroke-[2.5]" />
                                                    <span>Update Profile</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>

                            </div>

                            {/* SECTION: PROFESSIONAL INFORMATION */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                                <div className="flex items-start sm:items-center justify-between mb-8 pb-5 border-b border-white/5 gap-4">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                            Professional Information
                                        </h2>
                                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                            Bio, skills, experience and social links.
                                        </p>
                                    </div>

                                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <Briefcase size={20} className="text-purple-400 stroke-[2.5]" />
                                    </div>
                                </div>

                                <div className="space-y-6">

                                    {/* BIO */}
                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            About / Bio
                                        </label>
                                        <div className="relative">
                                            <FileText size={18} className="absolute left-4 top-4 text-cyan-400 z-10" />
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={3}
                                                maxLength={300}
                                                placeholder="Tell me about yourself..."
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner resize-none"
                                            />
                                        </div>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-1 text-right">{bio.length}/300</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">

                                        {/* SKILLS */}
                                        <div>
                                            <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                                Skills
                                            </label>
                                            <div className="relative">
                                                <Code2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10" />
                                                <input
                                                    type="text"
                                                    value={skills}
                                                    onChange={(e) => setSkills(e.target.value)}
                                                    placeholder="React, Node.js, MongoDB"
                                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                                                />
                                            </div>
                                            <p className="text-[10px] font-mono text-zinc-600 mt-1">Separate with commas</p>
                                        </div>

                                        {/* EXPERIENCE LEVEL */}
                                        <div>
                                            <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                                Experience Level
                                            </label>
                                            <div className="relative">
                                                <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 z-10" />
                                                <select
                                                    value={experienceLevel}
                                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 text-sm font-mono text-white transition-all shadow-inner appearance-none cursor-pointer"
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                    <option value="Expert">Expert</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* GITHUB */}
                                        <div>
                                            <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                                GitHub URL
                                            </label>
                                            <div className="relative">
                                                <GithubIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
                                                <input
                                                    type="text"
                                                    value={githubUrl}
                                                    onChange={(e) => setGithubUrl(e.target.value)}
                                                    placeholder="https://github.com/username"
                                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {/* LINKEDIN */}
                                        <div>
                                            <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                                LinkedIn URL
                                            </label>
                                            <div className="relative">
                                                <LinkedinIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 z-10" />
                                                <input
                                                    type="text"
                                                    value={linkedinUrl}
                                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                                    placeholder="https://linkedin.com/in/username"
                                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
                                    <div className="relative group cursor-pointer w-full sm:w-auto">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300" />
                                        <button
                                            onClick={updateProfile}
                                            disabled={saving}
                                            className="relative w-full sm:w-auto h-12 px-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 shadow-lg cursor-pointer"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin text-cyan-400" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} className="text-cyan-400 stroke-[2.5]" />
                                                    <span>Update Profile</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: PASSWORD SECURITY */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                                <div className="flex items-start sm:items-center justify-between mb-6 gap-4">

                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                            Password & Security
                                        </h2>

                                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                            Reset your password securely via email.
                                        </p>
                                    </div>

                                    <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <Lock
                                            size={20}
                                            className="text-rose-400 stroke-[2.5]"
                                        />
                                    </div>

                                </div>

                                <button
                                    onClick={sendOtp}
                                    className="cursor-pointer h-12 px-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-mono font-bold transition-all duration-300 shadow-inner active:scale-95 w-full sm:w-auto"
                                >
                                    <Lock size={16} className="stroke-[2.5]" />
                                    Change Password
                                </button>

                                {error && (
                                    <div className="mt-5 border border-rose-500/30 bg-rose-500/10 backdrop-blur-md rounded-2xl px-5 py-4 text-xs sm:text-sm font-mono font-bold text-rose-400 shadow-inner flex items-center gap-3">
                                        <AlertCircle size={18} className="stroke-[2.5] shrink-0" />
                                        {error}
                                    </div>
                                )}

                            </div>

                            {/* SECTION: TWO-FACTOR AUTHENTICATION (UI ONLY — implementation later) */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                            Two-Factor Authentication
                                        </h2>
                                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                            Add an extra layer of security to your account.
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <ShieldQuestion size={20} className="text-amber-400 stroke-[2.5]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-zinc-900/50 border border-white/5 rounded-2xl p-4 shadow-inner">
                                    <div>
                                        <p className="text-sm font-mono font-bold text-white">
                                            Enable 2FA
                                        </p>
                                        <p className="text-[10px] sm:text-xs font-mono text-zinc-500 mt-1">
                                            OTP verification will be required at login.
                                        </p>
                                    </div>
                                    {/* Static toggle — currently non-functional, implementation later */}
                                    <div className="h-7 w-12 rounded-full bg-zinc-800 border border-white/10 flex items-center px-1 cursor-not-allowed opacity-60 shrink-0">
                                        <div className="h-5 w-5 rounded-full bg-zinc-500" />
                                    </div>
                                </div>
                                <p className="text-[10px] sm:text-xs font-mono text-amber-500/70 mt-3">
                                    * Coming soon
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .toast-enter {
                    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .skeleton-shimmer {
                    background: linear-gradient(
                        90deg,
                        rgba(255,255,255,0) 0%,
                        rgba(255,255,255,0.06) 50%,
                        rgba(255,255,255,0) 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .custom-scrollbar::-webkit-scrollbar { width:4px; height:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
            `}</style>

        </DashboardLayout>
    );
};

export default ProfileSettings;