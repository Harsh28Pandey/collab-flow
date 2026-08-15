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

const Settings = () => {

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
                    teamName,
                    profileImageUrl: finalImageUrl
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
        <div className={`relative overflow-hidden bg-zinc-900/60 border border-white/5 rounded-xl ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
    );

    const showPreview =
        previewImage &&
        (
            previewImage.startsWith("blob:") ||
            isValidImageUrl(previewImage)
        );

    return (
        <DashboardLayout activeMenu="Settings">

            {/* TOAST (Glassmorphism Style) */}
            {toast.show && (
                <div className="fixed top-5 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none toast-enter">
                    <div className={`pointer-events-auto min-w-[280px] max-w-[420px] w-full px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl ${toast.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                    >
                        {toast.type === "success"
                            ? <CheckCircle2 size={22} className="shrink-0" />
                            : <XCircle size={22} className="shrink-0" />
                        }

                        <p className="text-sm font-mono font-bold leading-tight">
                            {toast.message}
                        </p>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Settings
                    </h1>

                    {/* ALWAYS VISIBLE DESCRIPTION */}
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-inner">

                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shadow-inner shrink-0">
                        <ShieldCheck
                            size={22}
                            className="text-cyan-400 stroke-[2.5]"
                        />
                    </div>

                    <div>
                        <p className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                            Account Status
                        </p>

                        <h3 className="font-mono font-black text-white mt-0.5 text-sm sm:text-base">
                            Secure & Active
                        </h3>
                    </div>
                </div>
            </div>

            {loading ? (

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                        <div className="flex flex-col items-center">

                            <Skeleton className="h-32 w-32 !rounded-full" />

                            <Skeleton className="h-6 w-40 mt-5 !rounded-lg" />

                            <Skeleton className="h-4 w-52 mt-3 !rounded-md" />

                            <div className="w-full mt-8 space-y-4">
                                <Skeleton className="h-24 w-full !rounded-2xl" />
                                <Skeleton className="h-24 w-full !rounded-2xl" />
                            </div>

                        </div>
                    </div>

                    <div className="xl:col-span-2 space-y-6">

                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                            <div className="flex items-center justify-between mb-8">

                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-52 !rounded-lg" />
                                    <Skeleton className="h-4 w-40 !rounded-md" />
                                </div>

                                <Skeleton className="h-12 w-12 !rounded-2xl" />

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <Skeleton className="h-12 w-full !rounded-2xl" />
                                <Skeleton className="h-12 w-full !rounded-2xl" />
                                <Skeleton className="h-12 w-full !rounded-2xl" />
                                <Skeleton className="h-12 w-full !rounded-2xl" />

                            </div>

                            <div className="flex justify-end mt-8">
                                <Skeleton className="h-12 w-40 !rounded-2xl" />
                            </div>

                        </div>

                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                            <div className="flex items-center justify-between mb-8">

                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-52 !rounded-lg" />
                                    <Skeleton className="h-4 w-40 !rounded-md" />
                                </div>

                                <Skeleton className="h-12 w-12 !rounded-2xl" />

                            </div>

                            <Skeleton className="h-12 w-44 !rounded-2xl" />

                        </div>
                    </div>
                </div>

            ) : (

                <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all duration-500 ease-out ${pageVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                    }`}
                >

                    {/* LEFT PANEL: PROFILE PIC & PREVIEW */}
                    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] h-fit">

                        <div className="flex flex-col items-center text-center">

                            <div className="relative group">
                                {/* Glow Effect Behind Avatar */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                {showPreview ? (
                                    <img
                                        src={previewImage}
                                        alt="profile"
                                        className="relative h-32 w-32 rounded-full object-cover border-[3px] border-zinc-950 bg-zinc-900 shadow-xl z-10"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display = "flex";
                                        }}
                                    />
                                ) : null}

                                {/* FALLBACK AVATAR */}
                                <div
                                    className="relative h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-zinc-950 items-center justify-center text-4xl font-black border-[3px] border-zinc-950 shadow-xl z-10"
                                    style={{
                                        display: showPreview
                                            ? "none"
                                            : "flex"
                                    }}
                                >
                                    {name?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                {/* UPLOAD BUTTON */}
                                <label className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-zinc-900 border border-white/10 text-cyan-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center shadow-lg cursor-pointer transition-all z-20 hover:scale-105 active:scale-95">
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
                                <p className="text-[11px] sm:text-xs font-mono text-emerald-400 mt-4 font-bold tracking-wide bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                    ✓ New image selected. Update to save.
                                </p>
                            )}

                            <h2 className="mt-5 text-xl font-mono font-black text-white tracking-wide">
                                {name || "No Name"}
                            </h2>

                            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1 break-all">
                                {email || "No Email"}
                            </p>

                            <div className="w-full mt-8 space-y-4">

                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">

                                    <p className="text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                        Team Name
                                    </p>

                                    <h4 className="text-sm sm:text-base font-mono font-bold text-white break-all">
                                        {teamName || "No Team"}
                                    </h4>

                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left shadow-inner">

                                    <p className="text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                        Team Code
                                    </p>

                                    <h4 className="text-sm sm:text-base font-mono font-bold text-cyan-400 tracking-wider break-all">
                                        {teamCode || "No Code"}
                                    </h4>

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: EDIT FORMS */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* SECTION 1: PROFILE INFO */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                            <div className="flex items-start sm:items-center justify-between mb-8 gap-4">

                                <div>
                                    <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide">
                                        Profile Information
                                    </h2>

                                    <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                        Update your personal and team details.
                                    </p>
                                </div>

                                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 shadow-inner">
                                    <User
                                        size={20}
                                        className="text-cyan-400 stroke-[2.5]"
                                    />
                                </div>

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <div>
                                    <label className="text-xs sm:text-sm font-mono font-bold text-zinc-300 block mb-2 uppercase tracking-wider">
                                        Name
                                    </label>

                                    <div className="relative">
                                        <User
                                            size={16}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 stroke-[2.5]"
                                        />

                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white transition-all shadow-inner placeholder-zinc-600"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs sm:text-sm font-mono font-bold text-zinc-300 block mb-2 uppercase tracking-wider">
                                        Team Name
                                    </label>

                                    <div className="relative">
                                        <Users
                                            size={16}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 stroke-[2.5]"
                                        />

                                        <input
                                            type="text"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 text-sm font-mono text-white transition-all shadow-inner placeholder-zinc-600"
                                            placeholder="Enter team name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs sm:text-sm font-mono font-bold text-zinc-300 block mb-2 uppercase tracking-wider">
                                        Email <span className="text-zinc-600 font-normal normal-case">(Read-only)</span>
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 stroke-[2.5]"
                                        />

                                        <input
                                            type="text"
                                            value={email}
                                            disabled
                                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/5 bg-zinc-900/40 text-zinc-500 text-sm font-mono shadow-inner cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs sm:text-sm font-mono font-bold text-zinc-300 block mb-2 uppercase tracking-wider">
                                        Team Code <span className="text-zinc-600 font-normal normal-case">(Read-only)</span>
                                    </label>

                                    <div className="relative">
                                        <KeyRound
                                            size={16}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 stroke-[2.5]"
                                        />

                                        <input
                                            type="text"
                                            value={teamCode}
                                            disabled
                                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/5 bg-zinc-900/40 text-zinc-500 text-sm font-mono shadow-inner cursor-not-allowed"
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
                                        className="relative w-full sm:w-auto cursor-pointer h-12 px-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all border border-white/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin text-cyan-400" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} className="text-cyan-400 stroke-[2.5]" />
                                                Update Profile
                                            </>
                                        )}
                                    </button>
                                </div>

                            </div>

                        </div>

                        {/* SECTION 2: PASSWORD SECURITY */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                            <div className="flex items-start sm:items-center justify-between mb-6 gap-4">

                                <div>
                                    <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide">
                                        Password & Security
                                    </h2>

                                    <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                        Reset your password securely via email.
                                    </p>
                                </div>

                                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0 shadow-inner">
                                    <Lock
                                        size={20}
                                        className="text-rose-400 stroke-[2.5]"
                                    />
                                </div>

                            </div>

                            <button
                                onClick={sendOtp}
                                className="cursor-pointer h-11 px-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner active:scale-95 w-full sm:w-auto"
                            >
                                <Lock size={15} className="stroke-[2.5]" />
                                Change Password
                            </button>

                            {error && (
                                <div className="mt-5 border border-rose-500/20 bg-rose-500/10 rounded-2xl px-5 py-3 text-xs sm:text-sm font-mono font-bold text-rose-400 shadow-inner">
                                    &gt; {error}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>

        </DashboardLayout>
    );
};

export default Settings;