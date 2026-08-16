import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    LuSearch, LuUpload, LuRefreshCcw, LuImage, LuVideo, LuFileText, LuFile, LuArrowUpRight, LuFolderOpen, LuTrash2, LuX
} from "react-icons/lu";
// Import loader from lucide-react correctly
import { Loader2 } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import toast from "react-hot-toast";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx"; // Imported TaskStatusTabs

// ─────────────────────────────────────────────
// Skeleton Components (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const FileCardSkeleton = () => (
    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-start justify-between">
            <SkeletonBlock className="h-14 w-14 rounded-2xl" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
            <SkeletonBlock className="h-5 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-4 w-1/2 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
            <SkeletonBlock className="h-10 w-28 rounded-2xl" />
            <SkeletonBlock className="h-10 w-10 rounded-2xl" />
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const FileManager = () => {

    const { user } = useContext(UserContext);

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    // Tab Filter State added
    const [activeTab, setActiveTab] = useState("All");

    const [uploading, setUploading] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const [deleting, setDeleting] = useState(false);

    // ─────────────────────────────────────────
    // FETCH FILES
    // ─────────────────────────────────────────

    const fetchFiles = async () => {

        try {

            if (!loading) {
                setRefreshing(true);
            }

            const response = await axiosInstance.get(
                API_PATHS.FILES.GET_PROJECT_FILES(
                    user?._id
                )
            );

            setFiles(
                response?.data?.files || []
            );

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to load files"
            );

        } finally {

            setLoading(false);

            setRefreshing(false);
        }
    };

    // ─────────────────────────────────────────
    // UPLOAD FILE
    // ─────────────────────────────────────────

    const handleFileUpload = async (e) => {

        try {

            const selectedFile = e.target.files[0];

            if (!selectedFile) return;

            setUploading(true);

            const formData = new FormData();

            formData.append(
                "title",
                selectedFile.name
            );

            formData.append(
                "projectId",
                user?._id
            );

            formData.append(
                "file",
                selectedFile
            );

            await axiosInstance.post(

                API_PATHS.FILES.UPLOAD_FILE,

                formData,

                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            toast.success(
                "File uploaded successfully"
            );

            fetchFiles();

        } catch (error) {

            console.log(error);

            toast.error(
                "Upload failed"
            );

        } finally {

            setUploading(false);
        }
    };

    // ─────────────────────────────────────────
    // DELETE FILE
    // ─────────────────────────────────────────

    const handleDeleteFile = async () => {

        try {

            setDeleting(true);

            await axiosInstance.delete(
                API_PATHS.FILES.DELETE_FILE(
                    selectedFile?._id
                )
            );

            toast.success(
                "File deleted successfully"
            );

            setFiles((prev) =>
                prev.filter(
                    (item) =>
                        item._id !==
                        selectedFile._id
                )
            );

            setDeleteModal(false);

            setSelectedFile(null);

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to delete file"
            );

        } finally {

            setDeleting(false);
        }
    };

    // ─────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────

    useEffect(() => {

        if (user?._id) {
            fetchFiles();
        }

    }, [user]);

    useEffect(() => {

        const style = document.createElement("style");

        style.innerHTML = `
            @keyframes shimmer {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }

            .animate-shimmer {
                animation: shimmer 1.5s infinite linear;
            }

            @keyframes modalPop {
                from {
                    opacity: 0;
                    transform: scale(0.96) translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .animate-modalPop {
                animation: modalPop .25s ease;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            .animate-fadeIn {
                animation: fadeIn .2s ease;
            }

            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }

            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;

        document.head.appendChild(style);

        return () =>
            document.head.removeChild(style);

    }, []);

    // ─────────────────────────────────────────
    // COUNTS & TABS
    // ─────────────────────────────────────────

    const counts = useMemo(() => {
        return {
            images: files.filter((f) => f.fileType === "image").length,
            videos: files.filter((f) => f.fileType === "video").length,
            pdfs: files.filter((f) => f.fileType === "pdf").length,
            others: files.filter((f) => !["image", "video", "pdf"].includes(f.fileType)).length,
        };
    }, [files]);

    const TABS = useMemo(() => [
        { label: "All", count: files.length },
        { label: "Images", count: counts.images },
        { label: "Videos", count: counts.videos },
        { label: "PDFs", count: counts.pdfs },
        { label: "Others", count: counts.others },
    ], [files.length, counts]);

    // ─────────────────────────────────────────
    // FILTERED FILES
    // ─────────────────────────────────────────

    const filteredFiles = useMemo(() => {
        return files.filter((file) => {
            const search = searchQuery.toLowerCase();
            const matchesSearch = file?.title?.toLowerCase().includes(search) || file?.originalName?.toLowerCase().includes(search);

            let matchesTab = true;
            if (activeTab === "Images") matchesTab = file.fileType === "image";
            else if (activeTab === "Videos") matchesTab = file.fileType === "video";
            else if (activeTab === "PDFs") matchesTab = file.fileType === "pdf";
            else if (activeTab === "Others") matchesTab = !["image", "video", "pdf"].includes(file.fileType);

            return matchesSearch && matchesTab;
        });
    }, [files, searchQuery, activeTab]);


    // ─────────────────────────────────────────
    // FILE ICON
    // ─────────────────────────────────────────

    const getFileIcon = (type) => {

        switch (type) {

            case "image":
                return <LuImage className="text-cyan-400 text-2xl" />;

            case "video":
                return <LuVideo className="text-purple-400 text-2xl" />;

            case "pdf":
                return <LuFileText className="text-rose-400 text-2xl" />;

            default:
                return <LuFile className="text-zinc-400 text-2xl" />;
        }
    };

    // ─────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────

    return (

        <DashboardLayout activeMenu="File Manager">

            <div className="space-y-6">

                {/* Header */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div className="min-w-0">

                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                            File Manager
                        </h1>

                        {/* Description visible in both responsive and desktop */}
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                            Upload, organize and manage all project files.
                        </p>
                    </div>

                    {/* Actions responsive row */}
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">

                        {/* Refresh */}
                        <button
                            onClick={fetchFiles}
                            disabled={refreshing || loading}
                            className="flex-1 sm:flex-none h-12 sm:h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold text-zinc-300 hover:text-white transition-all shadow-inner cursor-pointer"
                        >

                            <LuRefreshCcw
                                className={`${refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} text-lg sm:text-base`}
                            />

                            {/* Text visible in mobile too */}
                            <span>Refresh</span>
                        </button>

                        {/* Upload */}
                        <div className="relative group cursor-pointer flex-1 sm:flex-none">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <label
                                className="relative flex-1 sm:flex-none h-12 sm:h-11 px-4 sm:px-6 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 cursor-pointer text-nowrap"
                            >

                                {uploading ? (

                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                                        {/* Text visible in mobile too */}
                                        <span>Uploading...</span>
                                    </>

                                ) : (

                                    <>
                                        <LuUpload className="text-cyan-400 stroke-[3] text-lg sm:text-base" />

                                        {/* Text visible in mobile too */}
                                        <span>Upload File</span>
                                    </>
                                )}

                                <input
                                    type="file"
                                    hidden
                                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Search + Stats (TaskStatusTabs Style) */}

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2">

                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">

                        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-lg z-10 pointer-events-none" />

                        <input
                            type="text"
                            placeholder="Search files by title or filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner"
                        />
                    </div>

                    {/* Stats Tabs (Inline Style using TaskStatusTabs component) */}
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">
                        <div className="min-w-max">
                            <TaskStatusTabs
                                tabs={TABS}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        </div>
                    </div>
                </div>

                {/* Loading / Empty / Grid */}

                {loading ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, index) => (
                            <FileCardSkeleton key={index} />
                        ))}
                    </div>

                ) : filteredFiles.length === 0 ? (

                    /* Empty State */
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">

                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <LuFolderOpen className="text-4xl text-cyan-400" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                            No Files Found
                        </h3>

                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                            {searchQuery
                                ? "No files matched your search query."
                                : activeTab !== "All"
                                    ? `No ${activeTab} uploaded yet.`
                                    : "No project files uploaded yet. Upload images, videos, PDFs and documents to manage them here."
                            }
                        </p>

                        {!searchQuery && activeTab === "All" && (
                            <div className="relative group cursor-pointer mt-6">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <label className="relative h-12 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer active:scale-95 shadow-lg">
                                    <LuUpload className="text-cyan-400 stroke-[3] text-lg" />
                                    Upload File
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                ) : (

                    <>
                        {/* Result Count */}
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs font-mono text-zinc-400">
                                Showing{" "}
                                <span className="font-bold text-cyan-400">
                                    {filteredFiles.length}
                                </span>{" "}
                                file{filteredFiles.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Files Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                            {filteredFiles.map((file) => (

                                <div
                                    key={file._id}
                                    className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 relative flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                                                {getFileIcon(file.fileType)}
                                            </div>

                                            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 border border-white/5 text-zinc-400 px-3 py-1.5 rounded-xl shadow-inner">
                                                {file.fileType}
                                            </span>
                                        </div>

                                        <div className="mt-5">
                                            <h3 className="font-mono font-bold text-base sm:text-lg text-white truncate tracking-wide">
                                                {file.title}
                                            </h3>

                                            <p className="text-xs font-mono text-zinc-500 mt-1 truncate">
                                                {file.originalName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">

                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 h-10 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-cyan-400 text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-inner cursor-pointer"
                                        >
                                            Open File
                                            <LuArrowUpRight className="text-lg" />
                                        </a>

                                        <button
                                            onClick={() => {
                                                setSelectedFile(file);
                                                setDeleteModal(true);
                                            }}
                                            className="h-10 w-10 shrink-0 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-all shadow-inner cursor-pointer"
                                        >
                                            <LuTrash2 className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Delete Modal */}

            {deleteModal && (

                <div className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">

                    <div className="relative w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 animate-[modalPop_.25s_ease] overflow-hidden">

                        {/* Top Glow Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setDeleteModal(false);
                                setSelectedFile(null);
                            }}
                            className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
                        >
                            <LuX className="text-base" />
                        </button>

                        <div className="flex flex-col">

                            <h2 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight leading-snug pr-8">
                                Delete File
                            </h2>

                            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-2 leading-relaxed">
                                Are you sure you want to delete this file? This action cannot be undone.
                            </p>

                            {/* File Info */}
                            <div className="mt-5 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-inner">
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold mb-1">
                                    Selected File
                                </p>
                                <h3 className="text-sm font-mono font-bold text-cyan-400 truncate">
                                    {selectedFile?.title}
                                </h3>
                            </div>

                            {/* Buttons */}
                            <div className="mt-7 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">

                                <button
                                    onClick={() => {
                                        setDeleteModal(false);
                                        setSelectedFile(null);
                                    }}
                                    className="w-full h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono font-bold text-xs sm:text-sm transition-all shadow-inner cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeleteFile}
                                    disabled={deleting}
                                    className="w-full h-11 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <LuTrash2 size={15} />
                                            Delete File
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FileManager;