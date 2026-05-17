import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Calendar,
    Clock,
    Search,
    RefreshCw,
    Vote,
    Trash2,
    X
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

import CreatePollModal from "../../components/Polls/CreatePollModal.jsx";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";


// ───────────────────────────────────────────────────────────────────────────────
// Skeleton Components
// ───────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
    />
);

const PollCardSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">

        {/* Question */}
        <div className="space-y-2">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-5 w-1/2" />
        </div>

        {/* Options */}
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock className="w-6 h-6 rounded-full shrink-0" />
                    <SkeletonBlock className="h-4 flex-1" />
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
                <SkeletonBlock className="h-8 w-48" />
                <SkeletonBlock className="h-4 w-72" />
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
    // 2. ADD DELETE FUNCTION
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Manage Polls
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Create, manage and monitor all polls across your workspace.
                        </p>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => fetchPolls(true)}
                        disabled={refreshing}
                        className="h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all cursor-pointer disabled:opacity-60 self-start lg:self-auto"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>

                </div>

                {/* ───────────────── Search + Tabs ───────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Search */}
                    <div className="relative flex-1">

                        <Search
                            size={15}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search polls by question..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all"
                        />

                    </div>

                    {/* Tabs */}
                    <div className="overflow-x-auto scrollbar-hide">

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
                {filteredPolls.length > 0 && (
                    <div className="flex items-center justify-between">

                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {filteredPolls.length}
                            </span>{" "}
                            poll{filteredPolls.length !== 1 ? "s" : ""}
                        </p>

                    </div>
                )}

                {/* ───────────────── Empty State ───────────────── */}
                {loading ? (

                    <CreatePollsSkeleton />

                ) : filteredPolls.length === 0 ? (

                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center">

                        <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                            <Vote size={40} className="text-blue-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-800">

                            {searchQuery
                                ? "No Polls Found 🔍"
                                : filter === "Active"
                                    ? "No Active Polls 🗳️"
                                    : filter === "Closed"
                                        ? "No Closed Polls 📋"
                                        : "No Polls Created Yet 🗳️"
                            }

                        </h3>

                        <p className="text-gray-500 max-w-md mt-3 leading-relaxed">

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
                                className="mt-6 h-11 px-6 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer"
                            >
                                Clear Search
                            </button>

                        ) : filter !== "All" ? (

                            <button
                                onClick={() => setFilter("All")}
                                className="mt-6 h-11 px-6 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer"
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
                                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative"
                                >

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => {
                                            setSelectedPollId(poll._id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    {/* Question */}
                                    <h2 className="font-bold text-lg text-gray-800 mb-4 leading-snug">
                                        {poll?.question || "No Question"}
                                    </h2>

                                    {/* Options */}
                                    <ul className="space-y-2 mb-5">

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
                                                        className="flex items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50 rounded-2xl px-3 py-3"
                                                    >

                                                        <div className="flex items-center gap-3 min-w-0">

                                                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center shrink-0">
                                                                {i + 1}
                                                            </span>

                                                            <span className="truncate font-medium">
                                                                {opt?.text || "No option"}
                                                            </span>

                                                        </div>

                                                        {/* Percentage */}
                                                        <div className="flex items-center gap-2 shrink-0">

                                                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                                                                {percentage}%
                                                            </span>

                                                            <span className="text-xs text-gray-400">
                                                                ({votes})
                                                            </span>

                                                        </div>

                                                    </li>

                                                );

                                            })

                                        ) : (

                                            <li className="text-sm text-gray-400">
                                                No options available
                                            </li>

                                        )}

                                    </ul>

                                    {/* Expiry */}
                                    <div
                                        className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl w-fit
                                            ${expired
                                                ? "bg-red-50 text-red-500"
                                                : "bg-green-50 text-green-600"
                                            }`}
                                    >

                                        {expired ? (
                                            <Clock size={13} />
                                        ) : (
                                            <Calendar size={13} />
                                        )}

                                        <span>
                                            {expired ? "Expired: " : "Expires: "}
                                            {formatExpiry(expiryDate)}
                                        </span>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

                {/* ───────────────── Floating Create Button ───────────────── */}
                <button
                    onClick={() => setOpenModal(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white h-14 px-5 rounded-2xl shadow-lg flex items-center gap-2 transition-all duration-200 ease-in-out cursor-pointer hover:scale-105 active:scale-95 z-50"
                >
                    <Plus size={18} />
                    <span className="font-medium">
                        Create Poll
                    </span>
                </button>

                {/* ───────────────── Delete Modal ───────────────── */}

                {showDeleteModal && (

                    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

                        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative animate-[fadeIn_.2s_ease]">

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPollId(null);
                                }}
                                className="absolute top-4 right-4 w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">

                                <Trash2
                                    size={30}
                                    className="text-red-500"
                                />

                            </div>

                            {/* Heading */}
                            <h2 className="text-2xl font-bold text-gray-900 leading-snug">

                                Are you sure you want to delete this poll?

                            </h2>

                            {/* Description */}
                            <p className="text-sm text-gray-500 mt-3 leading-relaxed">

                                This action cannot be undone. The poll will be permanently removed from the database.

                            </p>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 mt-8">

                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedPollId(null);
                                    }}
                                    className="h-11 px-5 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeletePoll}
                                    disabled={deleting}
                                    className="h-11 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {deleting ? "Deleting..." : "Delete Poll"}
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