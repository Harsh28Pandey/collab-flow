import React, { useEffect, useState } from "react";
import {
    Camera, Loader2, Lock, Mail, Save, ShieldCheck,
    User, Users, KeyRound, CheckCircle2, XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

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
    // Backend already has /api/auth/upload-image
    // So direct backend upload use karo
    // ==========================================
    const updateProfile = async () => {

        try {

            setSaving(true);
            setError("");

            let finalImageUrl = savedImageUrl;

            // ======================================
            // STEP 1: Upload image to backend
            // ======================================
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

            // ======================================
            // STEP 2: Update profile
            // ======================================
            const res = await axiosInstance.put(
                API_PATHS.SETTINGS.UPDATE_SETTINGS,
                {
                    name,
                    profileImageUrl: finalImageUrl
                }
            );

            // ======================================
            // STEP 3: Update local states
            // ======================================
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
                            ? <CheckCircle2 size={22} className="stroke-[2.5]" />
                            : <XCircle size={22} className="stroke-[2.5]" />
                        }

                        <p className="text-sm font-mono font-bold tracking-wide">
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
                            Manage your account settings and preferences
                        </p>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-inner">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-inner">
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

                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 min-h-[500px] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                            <div className="flex flex-col items-center pt-8">
                                <Skeleton className="h-32 w-32 !rounded-full animate-pulse" />
                                <Skeleton className="h-6 w-40 mt-6 animate-pulse" />
                                <Skeleton className="h-4 w-52 mt-3 animate-pulse" />

                                <div className="w-full mt-10 space-y-4">
                                    <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                                    <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-2 space-y-6">

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 min-h-[420px] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
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

                    <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all duration-500 ${pageVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                        }`}
                    >

                        {/* LEFT COL - PROFILE CARD */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
                            
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

                            <div className="flex flex-col items-center text-center relative z-10 pt-4">

                                <div className="relative">

                                    {showPreview ? (
                                        <img
                                            src={previewImage}
                                            alt="profile"
                                            className="h-32 w-32 rounded-full object-cover border-[3px] border-zinc-900 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display = "flex";
                                            }}
                                        />
                                    ) : null}

                                    {/* FALLBACK */}
                                    <div
                                        className="h-32 w-32 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white items-center justify-center text-4xl font-black border-[3px] border-zinc-900 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                                        style={{
                                            display: showPreview
                                                ? "none"
                                                : "flex"
                                        }}
                                    >
                                        {name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>

                                    <label className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-cyan-400 flex items-center justify-center shadow-lg border-2 border-zinc-950 cursor-pointer transition-colors">
                                        <Camera size={18} className="stroke-[2.5]" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                </div>

                                {newImageFile && (
                                    <p className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 mt-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                                        New image selected — Save to apply
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
                                        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                            Team Name
                                        </p>
                                        <h4 className="text-sm font-mono font-bold text-white mt-1 truncate">
                                            {teamName || "No Team"}
                                        </h4>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">
                                        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                            Team Code
                                        </p>
                                        <h4 className="text-sm font-mono font-bold text-white mt-1 break-all">
                                            {teamCode || "No Code"}
                                        </h4>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL - DETAILS & PASSWORD */}
                        <div className="xl:col-span-2 space-y-6">

                            {/* DETAILS UPDATE */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                                <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/5">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                            Profile Information
                                        </h2>
                                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                            Update your personal details
                                        </p>
                                    </div>

                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner shrink-0">
                                        <User size={20} className="text-blue-400 stroke-[2.5]" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Team Name (Read-Only)
                                        </label>
                                        <div className="relative opacity-60">
                                            <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
                                            <input
                                                type="text"
                                                value={teamName}
                                                disabled
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/5 bg-zinc-900/50 text-zinc-400 text-sm font-mono cursor-not-allowed shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                            Email Address (Read-Only)
                                        </label>
                                        <div className="relative opacity-60">
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
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
                                            Team Code (Read-Only)
                                        </label>
                                        <div className="relative opacity-60">
                                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
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
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                        <button
                                            onClick={updateProfile}
                                            disabled={saving}
                                            className="relative w-full sm:w-auto h-12 px-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-sm font-mono font-bold border border-white/10 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 shadow-lg cursor-pointer"
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

                            {/* PASSWORD CHANGE */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                            Password & Security
                                        </h2>
                                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                            Reset your password securely via OTP
                                        </p>
                                    </div>

                                    <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner shrink-0">
                                        <Lock size={20} className="text-rose-400 stroke-[2.5]" />
                                    </div>
                                </div>

                                <button
                                    onClick={sendOtp}
                                    className="cursor-pointer h-12 px-6 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all duration-300 shadow-inner active:scale-95 w-full sm:w-auto"
                                >
                                    <Lock size={16} className="stroke-[2.5]" />
                                    Change Password
                                </button>

                            </div>

                            {error && (
                                <div className="border border-rose-500/30 bg-rose-500/10 backdrop-blur-md rounded-2xl px-5 py-4 text-xs sm:text-sm font-mono font-bold text-rose-400 shadow-inner flex items-center gap-3">
                                    <AlertCircle size={18} className="stroke-[2.5]" />
                                    {error}
                                </div>
                            )}

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
                        rgba(255,255,255,0.05) 50%,
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