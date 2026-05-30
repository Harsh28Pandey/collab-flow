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

import { UserContext } from "../../context/userContext.jsx";

import axiosInstance from "../../utils/axiosInstance.js";

import { API_PATHS } from "../../utils/apiPaths.js";

import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
    />
);

const FileCardSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">

        <div className="flex items-start justify-between">

            <SkeletonBlock className="h-14 w-14 rounded-2xl" />

            <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>

        <div className="space-y-2">

            <SkeletonBlock className="h-5 w-3/4" />

            <SkeletonBlock className="h-4 w-1/2" />
        </div>

        <div className="flex items-center justify-between pt-3">

            <SkeletonBlock className="h-10 w-28 rounded-2xl" />

            <SkeletonBlock className="h-5 w-16" />
        </div>
    </div>
);

const Files = () => {

    const { user } = useContext(UserContext);

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

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

                    return (

                        file?.title
                            ?.toLowerCase()
                            .includes(search) ||

                        file?.originalName
                            ?.toLowerCase()
                            .includes(search)
                    );
                }
            );

        }, [files, searchQuery]);

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
    // FILE ICON
    // ─────────────────────────────────────────

    const getFileIcon = (
        type
    ) => {

        switch (type) {

            case "image":
                return (
                    <LuImage className="text-blue-600 text-2xl" />
                );

            case "video":
                return (
                    <LuVideo className="text-purple-600 text-2xl" />
                );

            case "pdf":
                return (
                    <LuFileText className="text-red-600 text-2xl" />
                );

            default:
                return (
                    <LuFile className="text-gray-700 text-2xl" />
                );
        }
    };

    return (

        <DashboardLayout activeMenu="Files">

            <div className="space-y-6">

                {/* Header */}

                <div className="flex flex-row items-center justify-between gap-3">

                    <div className="min-w-0">

                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">
                            Files
                        </h1>

                        <p className="hidden sm:block text-sm text-gray-500 mt-1">
                            Browse and access all shared project files.
                        </p>
                    </div>

                    <button
                        onClick={fetchFiles}
                        className="h-10 w-10 sm:w-auto sm:px-4 sm:h-11 rounded-2xl border border-blue-100 bg-white hover:bg-blue-50 flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer"
                    >

                        <LuRefreshCcw
                            className={`${refreshing
                                ? "animate-spin"
                                : ""
                                } text-blue-600`}
                        />

                        <span className="hidden sm:inline text-blue-600">
                            Refresh
                        </span>
                    </button>
                </div>

                {/* Search + Stats */}

                <div className="flex flex-col xl:flex-row xl:items-center gap-4">

                    <div className="relative flex-1">

                        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

                        <input
                            type="text"
                            placeholder="Search files by title or filename..."
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">

                        <div className="min-w-max flex items-center gap-3">

                            <div className="bg-blue-50 text-blue-700 border border-blue-100 px-4 h-12 rounded-2xl flex items-center gap-2 text-sm font-semibold">
                                <LuImage />
                                Images
                                <span className="bg-white px-2 py-0.5 rounded-lg text-xs">
                                    {counts.images}
                                </span>
                            </div>

                            <div className="bg-purple-50 text-purple-700 border border-purple-100 px-4 h-12 rounded-2xl flex items-center gap-2 text-sm font-semibold">
                                <LuVideo />
                                Videos
                                <span className="bg-white px-2 py-0.5 rounded-lg text-xs">
                                    {counts.videos}
                                </span>
                            </div>

                            <div className="bg-red-50 text-red-700 border border-red-100 px-4 h-12 rounded-2xl flex items-center gap-2 text-sm font-semibold">
                                <LuFileText />
                                PDFs
                                <span className="bg-white px-2 py-0.5 rounded-lg text-xs">
                                    {counts.pdfs}
                                </span>
                            </div>

                            <div className="bg-gray-100 text-gray-700 border border-gray-200 px-4 h-12 rounded-2xl flex items-center gap-2 text-sm font-semibold">
                                <LuFolderOpen />
                                Others
                                <span className="bg-white px-2 py-0.5 rounded-lg text-xs">
                                    {counts.others}
                                </span>
                            </div>

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

                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center">

                        <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">

                            <LuFolderOpen className="text-5xl text-blue-500" />

                        </div>

                        <h3 className="text-2xl font-bold text-gray-800">
                            No Files Found
                        </h3>

                        <p className="text-gray-500 max-w-md mt-3 leading-relaxed">

                            {searchQuery
                                ? "No files matched your search query."
                                : "No project files are available right now."
                            }

                        </p>

                    </div>

                ) : (

                    <>

                        <div className="flex items-center justify-between">

                            <p className="text-sm text-gray-500">

                                Showing{" "}

                                <span className="font-semibold text-gray-900">
                                    {filteredFiles.length}
                                </span>{" "}

                                files

                            </p>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">

                            {filteredFiles.map((file) => (

                                <div
                                    key={file._id}
                                    className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">

                                            {getFileIcon(file.fileType)}

                                        </div>

                                        <span className="text-xs capitalize bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-600">

                                            {file.fileType}

                                        </span>

                                    </div>

                                    <div className="mt-5">

                                        <h3 className="font-bold text-gray-900 line-clamp-1">

                                            {file.title}

                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">

                                            {file.originalName}

                                        </p>

                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-3">

                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="h-10 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                        >

                                            Open File

                                            <LuArrowUpRight className="text-base" />

                                        </a>

                                        <span className="text-xs text-gray-400 font-medium truncate">

                                            {file?.uploadedBy?.name || "Unknown"}

                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </>

                )}

            </div>

        </DashboardLayout>
    );
};

export default Files;