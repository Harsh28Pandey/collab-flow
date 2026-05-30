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
        <div className={`relative overflow-hidden bg-gray-200 rounded-xl ${className}`}>
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
                    <div className={`pointer-events-auto min-w-[280px] max-w-[420px] w-full px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                        }`}
                    >
                        {toast.type === "success"
                            ? <CheckCircle2 size={22} />
                            : <XCircle size={22} />
                        }

                        <p className="text-sm font-medium">
                            {toast.message}
                        </p>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Profile Settings
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage your account settings
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center gap-4">

                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <ShieldCheck
                            size={22}
                            className="text-blue-600"
                        />
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Account Status
                        </p>

                        <h3 className="font-bold text-gray-900">
                            Secure & Active
                        </h3>
                    </div>
                </div>
            </div>

            {loading ? (

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    <div className="bg-white rounded-3xl border border-gray-200 p-6 min-h-[650px]">

                        <div className="flex flex-col items-center">

                            <Skeleton className="h-32 w-32 rounded-full animate-pulse" />

                            <Skeleton className="h-6 w-40 mt-5 animate-pulse" />

                            <Skeleton className="h-4 w-52 mt-3 animate-pulse" />

                            <div className="w-full mt-6 space-y-4">
                                <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                                <Skeleton className="h-20 w-full rounded-2xl animate-pulse" />
                            </div>

                        </div>
                    </div>

                    <div className="xl:col-span-2 space-y-6">

                        <div className="bg-white rounded-3xl border border-gray-200 p-6 min-h-[420px]">

                            <div className="flex items-center justify-between mb-8">

                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-52 animate-pulse" />
                                    <Skeleton className="h-4 w-40 animate-pulse" />
                                </div>

                                <Skeleton className="h-12 w-12 rounded-2xl animate-pulse" />

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <Skeleton className="h-12 w-full animate-pulse" />
                                <Skeleton className="h-12 w-full animate-pulse" />
                                <Skeleton className="h-12 w-full animate-pulse" />
                                <Skeleton className="h-12 w-full animate-pulse" />

                            </div>

                            <div className="flex justify-end mt-6">
                                <Skeleton className="h-12 w-40 rounded-2xl animate-pulse" />
                            </div>

                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 p-6 min-h-[220px]">

                            <div className="flex items-center justify-between mb-8">

                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-52 animate-pulse" />
                                    <Skeleton className="h-4 w-40 animate-pulse" />
                                </div>

                                <Skeleton className="h-12 w-12 rounded-2xl animate-pulse" />

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

                    {/* LEFT */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6">

                        <div className="flex flex-col items-center text-center">

                            <div className="relative">

                                {showPreview ? (
                                    <img
                                        src={previewImage}
                                        alt="profile"
                                        className="h-32 w-32 rounded-full object-cover border-4 border-blue-100"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display = "flex";
                                        }}
                                    />
                                ) : null}

                                {/* FALLBACK */}
                                <div
                                    className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white items-center justify-center text-4xl font-bold border-4 border-blue-100"
                                    style={{
                                        display: showPreview
                                            ? "none"
                                            : "flex"
                                    }}
                                >
                                    {name?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <label className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg cursor-pointer">

                                    <Camera size={18} />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                            </div>

                            {newImageFile && (
                                <p className="text-xs text-blue-600 mt-2 font-medium">
                                    ✓ New image selected — save karo
                                </p>
                            )}

                            <h2 className="mt-5 text-xl font-bold text-gray-900">
                                {name || "No Name"}
                            </h2>

                            <p className="text-sm text-gray-500 mt-1 break-all">
                                {email || "No Email"}
                            </p>

                            <div className="w-full mt-5 space-y-3">

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left">

                                    <p className="text-xs text-gray-500">
                                        Team Name
                                    </p>

                                    <h4 className="text-sm font-semibold text-gray-900 mt-1">
                                        {teamName || "No Team"}
                                    </h4>

                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left">

                                    <p className="text-xs text-gray-500">
                                        Team Code
                                    </p>

                                    <h4 className="text-sm font-semibold text-gray-900 mt-1 break-all">
                                        {teamCode || "No Code"}
                                    </h4>

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="xl:col-span-2 space-y-6">

                        <div className="bg-white rounded-3xl border border-gray-200 p-6">

                            <div className="flex items-center justify-between mb-6">

                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Profile Information
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Update your details
                                    </p>
                                </div>

                                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                    <User
                                        size={22}
                                        className="text-blue-600"
                                    />
                                </div>

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <div>

                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Name
                                    </label>

                                    <div className="relative">

                                        <User
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />

                                    </div>
                                </div>

                                <div>

                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Team Name
                                    </label>

                                    <div className="relative">

                                        <Users
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={teamName}
                                            disabled
                                            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-100 text-gray-500 text-sm"
                                        />

                                    </div>
                                </div>

                                <div>

                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Email
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={email}
                                            disabled
                                            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-100 text-gray-500 text-sm"
                                        />

                                    </div>
                                </div>

                                <div>

                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Team Code
                                    </label>

                                    <div className="relative">

                                        <KeyRound
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={teamCode}
                                            disabled
                                            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-100 text-gray-500 text-sm"
                                        />

                                    </div>
                                </div>

                            </div>

                            <div className="flex justify-end mt-6">

                                <button
                                    onClick={updateProfile}
                                    disabled={saving}
                                    className="cursor-pointer h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >

                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Update Profile
                                        </>
                                    )}

                                </button>

                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 p-6">

                            <div className="flex items-center justify-between mb-6">

                                <div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Password & Security
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Reset password securely
                                    </p>

                                </div>

                                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center">

                                    <Lock
                                        size={22}
                                        className="text-red-500"
                                    />

                                </div>

                            </div>

                            <button
                                onClick={sendOtp}
                                className="cursor-pointer h-12 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                            >

                                <Lock size={18} />

                                Change Password

                            </button>

                        </div>

                        {error && (
                            <div className="border border-red-200 bg-red-50 rounded-2xl px-5 py-4 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-16px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .toast-enter {
                    animation: fadeIn 0.3s ease;
                }

                .skeleton-shimmer {
                    background:
                        linear-gradient(
                            90deg,
                            rgba(255,255,255,0) 0%,
                            rgba(255,255,255,0.6) 50%,
                            rgba(255,255,255,0) 100%
                        );

                    animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }

                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>

        </DashboardLayout>
    );
};

export default ProfileSettings;