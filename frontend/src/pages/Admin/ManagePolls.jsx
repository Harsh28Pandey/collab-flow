// src/pages/Polls/ManagePolls.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Calendar,
    Clock,
    Search,
    RefreshCw,
    Vote,
    Trash2,
    X,
    Loader2
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

import CreatePollModal from "../../components/Polls/CreatePollModal.jsx";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ───────────────────────────────────────────────────────────────────────────────
// Skeleton Components (Dark Mode Cyber Pulse)
// ───────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const PollCardSkeleton = () => (
    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-5">

        {/* Question */}
        <div className="space-y-2">
            <SkeletonBlock className="h-5 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-5 w-1/2 rounded-lg" />
        </div>

        {/* Options */}
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock className="w-6 h-6 rounded-full shrink-0" />
                    <SkeletonBlock className="h-4 flex-1 rounded-md" />
                </div>
            ))}
        </div>

        {/* Expiry */}
        <SkeletonBlock className="h-9 w-44 rounded-xl" />

    </div>
);

const CreatePollsSkeleton = () => (
    <div className="py-4 md:py-5 space-y-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div className="space-y-2">
                <SkeletonBlock className="h-8 w-48 rounded-lg" />
                <SkeletonBlock className="h-4 w-72 rounded-md" />
            </div>

            <SkeletonBlock className="h-11 w-28 rounded-2xl" />

        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <SkeletonBlock className="h-12 flex-1 rounded-2xl" />

            <SkeletonBlock className="h-11 w-72 rounded-full" />

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {[1, 2, 3, 4, 5, 6].map((i) => (
                <PollCardSkeleton key={i} />
            ))}

        </div>

    </div>
);

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────
const formatExpiry = (dateValue) => {
    if (!dateValue) return "No expiry set";

    const dateObj = new Date(dateValue);

    if (isNaN(dateObj.getTime())) return "Invalid date";

    const date = dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).toUpperCase();

    return `${date} at ${time}`;
};

const isExpired = (dateValue) => {
    if (!dateValue) return false;
    return new Date(dateValue) < new Date();
};

// ───────────────────────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────────────────────
const ManagePolls = () => {

    const [polls, setPolls] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("All");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPollId, setSelectedPollId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ───────────────────────────────────────────────────────────────────────────
    // Fetch Polls
    // ───────────────────────────────────────────────────────────────────────────
    const fetchPolls = async (isRefresh = false) => {
        try {

            isRefresh ? setRefreshing(true) : setLoading(true);

            const res = await axiosInstance.get(
                API_PATHS.POLLS.GET_ALL_POLLS
            );

            const data = res?.data?.polls;

            if (Array.isArray(data)) {

                const normalized = data.map((poll) => ({
                    ...poll,
                    options: Array.isArray(poll?.options)
                        ? poll.options.map((opt) =>
                            typeof opt === "string"
                                ? { text: opt }
                                : opt
                        )
                        : [],
                }));

                setPolls(normalized);

            } else {
                setPolls([]);
            }

        } catch (err) {
            console.error("Fetch Polls Error:", err);
            setPolls([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    // ───────────────────────────────────────────────────────────────────────────
    // Tabs
    // ───────────────────────────────────────────────────────────────────────────
    const activeCount = polls.filter(
        (p) => !isExpired(p?.expiry)
    ).length;

    const closedCount = polls.filter(
        (p) => isExpired(p?.expiry)
    ).length;

    const TABS = [
        { label: "All", count: polls.length },
        { label: "Active", count: activeCount },
        { label: "Closed", count: closedCount },
    ];

    // ───────────────────────────────────────────────────────────────────────────
    // Filter + Search
    // ───────────────────────────────────────────────────────────────────────────
    const filteredPolls = useMemo(() => {

        return polls.filter((poll) => {

            const expired = isExpired(poll?.expiry);

            const matchesFilter =
                filter === "Active"
                    ? !expired
                    : filter === "Closed"
                        ? expired
                        : true;

            const matchesSearch =
                poll?.question
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;

        });

    }, [polls, filter, searchQuery]);

    // ───────────────────────────────────────────────────────────────────────────────
    // DELETE FUNCTION
    // ───────────────────────────────────────────────────────────────────────────────

    const handleDeletePoll = async () => {

        if (!selectedPollId) return;

        try {

            setDeleting(true);

            await axiosInstance.delete(
                `${API_PATHS.POLLS.DELETE_POLL}/${selectedPollId}`
            );

            setPolls((prev) =>
                prev.filter((poll) => poll._id !== selectedPollId)
            );

            setShowDeleteModal(false);
            setSelectedPollId(null);

        } catch (error) {

            console.error("Delete Poll Error:", error);

            alert(
                error?.response?.data?.message ||
                "Failed to delete poll"
            );

        } finally {
            setDeleting(false);
        }
    };

    // ───────────────────────────────────────────────────────────────────────────
    // Shimmer Animation Inject
    // ───────────────────────────────────────────────────────────────────────────
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
                transform: scale(.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
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

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;

        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };

    }, []);

    return (
        <DashboardLayout activeMenu="Manage Polls">

            <div className="py-4 md:py-5 space-y-6">

                {/* ───────────────── Header ───────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                            Manage Polls
                        </h1>

                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                            Create, manage and monitor all polls across your workspace.
                        </p>
                    </div>

                    {/* Actions (Refresh + Create) */}
                    <div className="flex items-center gap-3 flex-shrink-0">

                        <button
                            onClick={() => fetchPolls(true)}
                            disabled={refreshing}
                            className="h-10 w-10 sm:w-auto sm:px-4 sm:h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center gap-2 text-sm font-mono font-bold text-zinc-300 hover:text-white shadow-inner transition-all cursor-pointer disabled:opacity-60"
                        >
                            <RefreshCw
                                size={16}
                                className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"}
                            />
                            <span className="hidden sm:inline">{refreshing ? "Refreshing" : "Refresh"}</span>
                        </button>

                        <div className="relative group cursor-pointer flex-1 sm:flex-none">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button
                                onClick={() => setOpenModal(true)}
                                className="relative w-full sm:w-auto h-10 px-4 sm:h-11 sm:px-6 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-sm font-mono font-bold border border-white/10 transition-all cursor-pointer active:scale-95 shadow-lg text-nowrap"
                            >
                                <Plus size={18} className="text-cyan-400 stroke-[3]" />
                                Create Poll
                            </button>
                        </div>

                    </div>

                </div>

                {/* ───────────────── Search + Tabs ───────────────── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2">

                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none"
                        />

                        <input
                            type="text"
                            placeholder="Search polls by question..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner"
                        />

                    </div>

                    {/* Tabs */}
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">
                        <div className="min-w-max">
                            <TaskStatusTabs
                                tabs={TABS}
                                activeTab={filter}
                                setActiveTab={setFilter}
                            />
                        </div>
                    </div>

                </div>

                {/* ───────────────── Result Count ───────────────── */}
                {filteredPolls.length > 0 && !loading && (
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-mono text-zinc-400">
                            Showing{" "}
                            <span className="font-bold text-cyan-400">
                                {filteredPolls.length}
                            </span>{" "}
                            poll{filteredPolls.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}

                {/* ───────────────── State Rendering ───────────────── */}
                {loading ? (

                    <CreatePollsSkeleton />

                ) : filteredPolls.length === 0 ? (

                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">

                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <Vote size={36} className="text-cyan-400" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">

                            {searchQuery
                                ? "No Polls Found"
                                : filter === "Active"
                                    ? "No Active Polls"
                                    : filter === "Closed"
                                        ? "No Closed Polls"
                                        : "No Polls Created Yet"
                            }

                        </h3>

                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">

                            {searchQuery
                                ? `No polls matched "${searchQuery}". Try different keywords.`
                                : filter === "Active"
                                    ? "There are no active polls available right now."
                                    : filter === "Closed"
                                        ? "No polls have been closed yet."
                                        : "No polls have been created yet. Click on Create Poll to get started."
                            }

                        </p>

                        {searchQuery ? (

                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-6 h-11 px-6 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-sm font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-inner"
                            >
                                Clear Search
                            </button>

                        ) : filter !== "All" ? (

                            <button
                                onClick={() => setFilter("All")}
                                className="mt-6 h-11 px-6 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-sm font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-inner"
                            >
                                View All Polls
                            </button>

                        ) : null}

                    </div>

                ) : (

                    /* ───────────────── Poll Grid ───────────────── */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                        {filteredPolls.map((poll) => {

                            const expiryDate = poll?.expiry || null;
                            const expired = isExpired(expiryDate);

                            return (
                                <div
                                    key={poll._id}
                                    className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 relative flex flex-col justify-between"
                                >

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => {
                                            setSelectedPollId(poll._id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-inner z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="flex-1">
                                        {/* Question */}
                                        <h2 className="font-mono font-bold text-base sm:text-lg text-white mb-5 leading-snug pr-12 line-clamp-3">
                                            {poll?.question || "No Question"}
                                        </h2>

                                        {/* Options */}
                                        <ul className="space-y-2 mb-6">

                                            {poll.options.length > 0 ? (

                                                poll.options.map((opt, i) => {

                                                    const votes = Array.isArray(opt?.votes)
                                                        ? opt.votes.length
                                                        : 0;

                                                    const totalVotes = poll.options.reduce(
                                                        (acc, curr) =>
                                                            acc +
                                                            (
                                                                Array.isArray(curr?.votes)
                                                                    ? curr.votes.length
                                                                    : 0
                                                            ),
                                                        0
                                                    );

                                                    const percentage =
                                                        totalVotes > 0
                                                            ? ((votes / totalVotes) * 100).toFixed(1)
                                                            : 0;

                                                    return (

                                                        <li
                                                            key={i}
                                                            className="flex items-center justify-between gap-3 text-xs sm:text-sm font-mono text-zinc-300 bg-zinc-900/50 border border-white/5 rounded-2xl px-3.5 py-3 shadow-inner"
                                                        >

                                                            <div className="flex items-center gap-3 min-w-0 flex-1">

                                                                <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center shrink-0">
                                                                    {i + 1}
                                                                </span>

                                                                <span className="truncate font-bold text-white">
                                                                    {opt?.text || "No option"}
                                                                </span>

                                                            </div>

                                                            {/* Percentage */}
                                                            <div className="flex items-center gap-2.5 shrink-0">

                                                                <span className="text-[11px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
                                                                    {percentage}%
                                                                </span>

                                                                <span className="text-[11px] text-zinc-500 font-bold w-6 text-right">
                                                                    ({votes})
                                                                </span>

                                                            </div>

                                                        </li>

                                                    );

                                                })

                                            ) : (

                                                <li className="text-sm font-mono text-zinc-500">
                                                    No options available
                                                </li>

                                            )}

                                        </ul>
                                    </div>

                                    {/* Expiry */}
                                    <div className="pt-4 border-t border-white/5">
                                        <div
                                            className={`flex items-center justify-center gap-2 text-xs font-mono font-bold px-3 py-2.5 rounded-xl w-full shadow-inner border
                                            ${expired
                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                }`}
                                        >

                                            {expired ? (
                                                <Clock size={14} className="stroke-[2.5]" />
                                            ) : (
                                                <Calendar size={14} className="stroke-[2.5]" />
                                            )}

                                            <span className="truncate">
                                                {expired ? "Expired: " : "Expires: "}
                                                {formatExpiry(expiryDate)}
                                            </span>

                                        </div>
                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

                {/* ───────────────── Delete Modal ───────────────── */}

                {showDeleteModal && (

                    <div className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">

                        <div className="w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 relative animate-[modalPop_.25s_ease]">

                            {/* Top Ambient Glow Line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPollId(null);
                                }}
                                className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
                            >
                                <X size={16} />
                            </button>

                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-5 shadow-inner">

                                <Trash2
                                    size={24}
                                    className="text-rose-400"
                                />

                            </div>

                            {/* Heading */}
                            <h2 className="text-xl sm:text-2xl font-mono font-black text-white leading-snug tracking-tight">
                                Delete this poll?
                            </h2>

                            {/* Description */}
                            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-2.5 leading-relaxed">
                                This action cannot be undone. The poll will be permanently removed from the database.
                            </p>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-white/5">

                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedPollId(null);
                                    }}
                                    className="h-11 px-5 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono font-bold transition-all cursor-pointer text-xs sm:text-sm shadow-inner"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeletePoll}
                                    disabled={deleting}
                                    className="h-11 px-6 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-mono font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2 text-xs sm:text-sm shadow-lg"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={15} />
                                            Delete Poll
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

                {/* ───────────────── Modal ───────────────── */}
                {openModal && (
                    <CreatePollModal
                        onClose={() => setOpenModal(false)}
                        onSuccess={(newPoll) => {

                            if (!newPoll) return;

                            const normalizedPoll = {
                                ...newPoll,
                                options: Array.isArray(newPoll.options)
                                    ? newPoll.options.map((opt) =>
                                        typeof opt === "string"
                                            ? { text: opt }
                                            : opt
                                    )
                                    : [],
                            };

                            setPolls((prev) => [
                                normalizedPoll,
                                ...prev,
                            ]);

                        }}
                    />
                )}

            </div>

        </DashboardLayout>
    );
};

export default ManagePolls;