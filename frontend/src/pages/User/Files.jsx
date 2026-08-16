import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    LuSearch,
    LuRefreshCcw,
    LuImage,
    LuVideo,
    LuFileText,
    LuFile,
    LuArrowUpRight,
    LuFolderOpen,
} from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx"; // Imported TaskStatusTabs
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const FileCardSkeleton = () => (
    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-start justify-between">
            <SkeletonBlock className="h-12 w-12 rounded-xl" />
            <SkeletonBlock className="h-6 w-16 rounded-lg" />
        </div>
        <div className="space-y-2 mt-4">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
            <SkeletonBlock className="h-9 w-24 rounded-xl" />
            <SkeletonBlock className="h-4 w-16" />
        </div>
    </div>
);

const Files = () => {

    const { user } = useContext(UserContext);

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All"); // Added state for tabs

    // ─────────────────────────────────────────
    // FETCH FILES
    // ─────────────────────────────────────────

    const fetchFiles = async () => {

        try {

            if (!loading) {
                setRefreshing(true);
            }

            const response =
                await axiosInstance.get(
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
    // EFFECTS
    // ─────────────────────────────────────────

    useEffect(() => {

        if (user?._id) {

            fetchFiles();
        }

    }, [user]);

    useEffect(() => {

        const style =
            document.createElement(
                "style"
            );

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
    // FILTERED FILES
    // ─────────────────────────────────────────

    const filteredFiles =
        useMemo(() => {

            return files.filter(
                (file) => {

                    const search =
                        searchQuery.toLowerCase();

                    const matchesSearch = file?.title?.toLowerCase().includes(search) ||
                        file?.originalName?.toLowerCase().includes(search);

                    let matchesTab = true;
                    if (activeTab === "Images") matchesTab = file.fileType === "image";
                    else if (activeTab === "Videos") matchesTab = file.fileType === "video";
                    else if (activeTab === "PDFs") matchesTab = file.fileType === "pdf";
                    else if (activeTab === "Others") matchesTab = !["image", "video", "pdf"].includes(file.fileType);

                    return matchesSearch && matchesTab;
                }
            );

        }, [files, searchQuery, activeTab]);

    // ─────────────────────────────────────────
    // COUNTS
    // ─────────────────────────────────────────

    const counts =
        useMemo(() => {

            return {

                images:
                    files.filter(
                        (f) =>
                            f.fileType ===
                            "image"
                    ).length,

                videos:
                    files.filter(
                        (f) =>
                            f.fileType ===
                            "video"
                    ).length,

                pdfs:
                    files.filter(
                        (f) =>
                            f.fileType ===
                            "pdf"
                    ).length,

                others:
                    files.filter(
                        (f) =>
                            ![
                                "image",
                                "video",
                                "pdf",
                            ].includes(
                                f.fileType
                            )
                    ).length,
            };

        }, [files]);

    // ─────────────────────────────────────────
    // FILE ICON & STYLE HELPERS
    // ─────────────────────────────────────────

    const getFileStyle = (type) => {
        switch (type) {
            case "image":
                return {
                    icon: <LuImage className="text-cyan-400 text-xl stroke-[2.5]" />,
                    wrapper: "bg-cyan-500/10 border-cyan-500/20",
                    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                };
            case "video":
                return {
                    icon: <LuVideo className="text-purple-400 text-xl stroke-[2.5]" />,
                    wrapper: "bg-purple-500/10 border-purple-500/20",
                    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20"
                };
            case "pdf":
                return {
                    icon: <LuFileText className="text-rose-400 text-xl stroke-[2.5]" />,
                    wrapper: "bg-rose-500/10 border-rose-500/20",
                    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20"
                };
            default:
                return {
                    icon: <LuFile className="text-zinc-400 text-xl stroke-[2.5]" />,
                    wrapper: "bg-zinc-800/50 border-white/10",
                    badge: "bg-zinc-800/50 text-zinc-300 border-white/10"
                };
        }
    };

    return (

        <DashboardLayout activeMenu="Files">

            <div className="space-y-6">

                {/* Header */}

                <div className="flex flex-row items-center justify-between gap-3">

                    <div className="min-w-0">

                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                            Files
                        </h1>

                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                            Browse and access all shared project files.
                        </p>
                    </div>

                    <button
                        onClick={fetchFiles}
                        disabled={loading || refreshing}
                        className="px-4 h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner shrink-0 cursor-pointer"
                    >

                        <LuRefreshCcw
                            className={`${refreshing
                                ? "animate-spin"
                                : ""
                                } text-cyan-400 stroke-[2.5]`}
                            size={16}
                        />

                        <span>
                            Refresh
                        </span>
                    </button>
                </div>

                {/* Search + Stats (TaskStatusTabs style) */}

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2">

                    <div className="relative flex-1 max-w-2xl">

                        <LuSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />

                        <input
                            type="text"
                            placeholder="Search files by title or filename..."
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner"
                        />
                    </div>

                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">

                        <div className="min-w-max flex items-center gap-1.5 h-12">
                            <TaskStatusTabs
                                tabs={[
                                    { label: "All", count: files.length, icon: <LuFile size={14} className="text-zinc-400" /> },
                                    { label: "Images", count: counts.images, icon: <LuImage size={14} className="text-cyan-400" /> },
                                    { label: "Videos", count: counts.videos, icon: <LuVideo size={14} className="text-purple-400" /> },
                                    { label: "PDFs", count: counts.pdfs, icon: <LuFileText size={14} className="text-rose-400" /> },
                                    { label: "Others", count: counts.others, icon: <LuFolderOpen size={14} className="text-zinc-400" /> }
                                ]}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        </div>
                    </div>
                </div>

                {/* Loading */}

                {loading ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">

                        {[...Array(6)].map((_, index) => (
                            <FileCardSkeleton key={index} />
                        ))}

                    </div>

                ) : filteredFiles.length === 0 ? (

                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">

                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">

                            <LuFolderOpen className="text-4xl text-cyan-400" />

                        </div>

                        <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">
                            No Files Found
                        </h3>

                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">

                            {searchQuery || activeTab !== "All"
                                ? "No files matched your search query or filter."
                                : "No project files are available right now."
                            }

                        </p>

                    </div>

                ) : (

                    <>

                        <div className="flex items-center justify-between px-1">

                            <p className="text-xs sm:text-sm font-mono text-zinc-400">

                                Showing{" "}

                                <span className="font-bold text-cyan-400">
                                    {filteredFiles.length}
                                </span>{" "}

                                files

                            </p>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">

                            {filteredFiles.map((file) => {
                                const style = getFileStyle(file.fileType);

                                return (
                                    <div
                                        key={file._id}
                                        className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                    >

                                        <div className="flex items-start justify-between gap-3">

                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${style.wrapper}`}>
                                                {style.icon}
                                            </div>

                                            <span className={`text-[10px] font-mono font-bold capitalize px-2.5 py-1 rounded-lg border shadow-inner shrink-0 ${style.badge}`}>
                                                {file.fileType}
                                            </span>

                                        </div>

                                        <div className="mt-4 flex-1">

                                            <h3 className="text-sm sm:text-base font-mono font-bold text-white line-clamp-1 tracking-wide">
                                                {file.title}
                                            </h3>

                                            <p className="text-xs font-mono text-zinc-500 mt-1 line-clamp-1">
                                                {file.originalName}
                                            </p>

                                        </div>

                                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">

                                            <div className="relative group cursor-pointer">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                                <a
                                                    href={file.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="relative h-9 px-4 rounded-xl bg-zinc-950 text-white text-xs font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                                                >
                                                    Open File
                                                    <LuArrowUpRight className="text-cyan-400 stroke-[3]" size={14} />
                                                </a>
                                            </div>

                                            <span className="text-[10px] sm:text-xs text-zinc-400 font-mono font-medium truncate max-w-[100px]">
                                                {file?.uploadedBy?.name || "Unknown"}
                                            </span>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </>

                )}

            </div>

        </DashboardLayout>
    );
};

export default Files;