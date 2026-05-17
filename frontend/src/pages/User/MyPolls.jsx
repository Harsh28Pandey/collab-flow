import React, { useEffect, useState, useMemo } from "react";
import {
    BarChart3,
    CalendarClock,
    CheckCircle2,
    Clock,
    Loader2,
    RefreshCw,
    Vote,
    TrendingUp,
    Search,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatExpiry = (dateValue) => {
    if (!dateValue) return "No expiry set";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleString("en-IN", {
        weekday: "short", day: "2-digit", month: "short",
        year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
    });
};

const isExpired = (dateValue) => {
    if (!dateValue) return false;
    return new Date(dateValue) < new Date();
};

const getTotalVotes = (options) =>
    options.reduce((sum, opt) => sum + (opt?.votes?.length || 0), 0);

const getVotePercent = (optVotes, total) =>
    total === 0 ? 0 : Math.round((optVotes / total) * 100);

const optionColors = [
    { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-300", bar: "bg-blue-500" },
    { bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-600", border: "border-violet-300", bar: "bg-violet-500" },
    { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-300", bar: "bg-emerald-500" },
    { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-300", bar: "bg-amber-500" },
    { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-300", bar: "bg-rose-500" },
    { bg: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-300", bar: "bg-cyan-500" },
];
const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const getColor = (i) => optionColors[i % optionColors.length];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`} />
);

const PollSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-100 to-violet-100" />
        <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-11 w-full" />
            ))}
        </div>
        <div className="h-10 bg-gray-50 border-t border-gray-100" />
    </div>
);

const MyPollsSkeleton = () => (
    <div className="py-4 md:py-5 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
                <SkeletonBlock className="h-8 w-32" />
                <SkeletonBlock className="h-4 w-64" />
            </div>
            <SkeletonBlock className="h-11 w-28 rounded-2xl" />
        </div>
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
            <SkeletonBlock className="h-11 w-64 rounded-xl" />
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => <PollSkeleton key={i} />)}
        </div>
    </div>
);

// ─── Poll Card ────────────────────────────────────────────────────────────────
const PollCard = ({ poll, currentUserId, onVote }) => {
    const [voting, setVoting] = useState(false);
    const [localPoll, setLocalPoll] = useState(poll);
    const [showResults, setShowResults] = useState(false);
    const [justVoted, setJustVoted] = useState(null);

    const expiryDate = localPoll?.expiry || null;
    const expired = isExpired(localPoll?.expiry);
    const options = localPoll?.options || [];
    const totalVotes = getTotalVotes(options);

    const userVotedIndex = options.findIndex((opt) =>
        Array.isArray(opt?.votes) &&
        opt.votes.some((v) => {
            if (typeof v === "object") {
                return String(v.userId) === String(currentUserId);
            }
            return String(v) === String(currentUserId);
        })
    );

    const hasVoted = userVotedIndex !== -1;
    const showResultsView = showResults || hasVoted || expired;

    const handleVote = async (optionIndex) => {
        if (voting || expired) return;

        const alreadyVoted = localPoll.options.some((opt) =>
            (opt.votes || []).some((v) => {
                if (typeof v === "object") {
                    return String(v.userId) === String(currentUserId);
                }
                return String(v) === String(currentUserId);
            })
        );

        if (alreadyVoted) return;

        let previousPoll = localPoll;
        try {
            setVoting(true);
            setJustVoted(optionIndex);

            const updatedLocal = {
                ...localPoll,
                options: localPoll.options.map((opt, i) => {
                    if (i === optionIndex) {
                        return { ...opt, votes: [...(opt.votes || []), { userId: currentUserId }] };
                    }
                    return opt;
                }),
            };
            setLocalPoll(updatedLocal);
            setShowResults(true);
            onVote && onVote(updatedLocal);

            const res = await axiosInstance.post(API_PATHS.POLLS.VOTE_POLL, {
                pollId: localPoll._id,
                optionIndex: Number(optionIndex),
            });

            if (res?.data) {
                const serverPoll = res.data.poll || res.data;
                const normalized = {
                    ...serverPoll,
                    options: Array.isArray(serverPoll?.options)
                        ? serverPoll.options.map((opt) =>
                            typeof opt === "string" ? { text: opt, votes: [] } : opt
                        )
                        : [],
                };
                setLocalPoll(normalized);
                onVote && onVote(normalized);
            }
        } catch (err) {
            // console.log("Backend Error:", err.response?.data);
            console.error("Vote Error:", err);

            setLocalPoll(previousPoll);
        } finally {
            setVoting(false);
        }
    };

    const leadingIndex = options.reduce(
        (maxIdx, opt, i, arr) =>
            (opt?.votes?.length || 0) > (arr[maxIdx]?.votes?.length || 0) ? i : maxIdx,
        0
    );

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                            <BarChart3 size={14} className="text-white" />
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expired ? "bg-red-400/30 text-red-100" : "bg-white/20 text-white"}`}>
                            {expired ? "Closed" : "Active"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-100 shrink-0">
                        <Vote size={12} />
                        <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                    </div>
                </div>
                <h2 className="text-white font-bold text-base mt-2 leading-snug">
                    {localPoll?.question || "No question"}
                </h2>
            </div>

            {/* Body */}
            <div className="p-5">

                {!showResultsView ? (

                    <div className="space-y-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Choose one option
                        </p>

                        {options.map((opt, i) => {

                            const color = getColor(i);

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    disabled={voting}
                                    onClick={() => handleVote(i)}
                                    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all duration-200 text-left cursor-pointer
                            
                            ${voting && justVoted === i
                                            ? `${color.light} ${color.border}`
                                            : "bg-gray-50 border-gray-100 hover:border-blue-200 hover:bg-blue-50/40"
                                        }
                        `}
                                >

                                    <div className={`w-8 h-8 rounded-xl ${color.bg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                        {optionLabels[i]}
                                    </div>

                                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                                        {opt?.text || "No option"}
                                    </span>

                                    {voting && justVoted === i && (
                                        <Loader2
                                            size={15}
                                            className="animate-spin text-gray-400 shrink-0"
                                        />
                                    )}

                                </button>
                            );
                        })}

                    </div>

                ) : (

                    <div className="space-y-3">

                        <div className="flex items-center justify-between">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1">
                                <TrendingUp size={12} />
                                Poll Results
                            </p>

                            {hasVoted && (
                                <div className="flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 size={12} />
                                    Voted
                                </div>
                            )}

                        </div>

                        {options.map((opt, i) => {

                            const votes = opt?.votes?.length || 0;

                            const pct = getVotePercent(votes, totalVotes);

                            const color = getColor(i);

                            const isLeading =
                                i === leadingIndex && totalVotes > 0;

                            const isMyVote =
                                i === userVotedIndex;

                            return (

                                <div
                                    key={i}
                                    className={`rounded-2xl border overflow-hidden transition-all duration-200
                            
                            ${isMyVote
                                            ? `${color.border} border-2`
                                            : "border-gray-100"
                                        }
                        `}
                                >

                                    <div className={`px-4 py-3 flex items-center gap-3
                            
                            ${isMyVote
                                            ? color.light
                                            : "bg-gray-50"
                                        }
                        `}>

                                        <div className={`w-8 h-8 rounded-xl ${color.bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                            {optionLabels[i]}
                                        </div>

                                        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                                            {opt?.text || "No option"}
                                        </span>

                                        {isLeading && (
                                            <span className="text-xs">
                                                🏆
                                            </span>
                                        )}

                                        {isMyVote && (
                                            <CheckCircle2
                                                size={14}
                                                className={color.text}
                                            />
                                        )}

                                        <span className={`text-xs font-bold ${isMyVote ? color.text : "text-gray-500"}`}>
                                            {pct}%
                                        </span>

                                    </div>

                                    {/* Progress */}
                                    <div className="h-1.5 bg-gray-100">

                                        <div
                                            className={`h-full ${color.bar} transition-all duration-700`}
                                            style={{ width: `${pct}%` }}
                                        />

                                    </div>

                                    {/* Votes */}
                                    <div className={`px-4 py-2 text-xs font-medium flex justify-end
                            
                            ${isMyVote
                                            ? `${color.light} ${color.text}`
                                            : "bg-gray-50 text-gray-400"
                                        }
                        `}>
                                        {votes} vote{votes !== 1 ? "s" : ""}
                                    </div>

                                </div>

                            );
                        })}

                        {!hasVoted && !expired && (

                            <button
                                onClick={() => setShowResults(false)}
                                className="text-xs font-medium text-blue-500 hover:text-blue-700 transition cursor-pointer"
                            >
                                ← Back to voting
                            </button>

                        )}

                    </div>

                )}

            </div>

            {/* Footer */}
            <div
                className={`flex items-center justify-between gap-3 px-5 py-3 border-t
        ${expired
                        ? "bg-red-50 border-red-100"
                        : "bg-green-50 border-green-100"
                    }
    `}
            >
                <div className={`flex items-center gap-1.5 text-xs font-medium ${expired ? "text-red-500" : "text-blue-600"}`}>
                    {expired ? <Clock size={12} /> : <CalendarClock size={12} />}
                    <span>{expired ? "Closed " : "Closes "}{formatExpiry(expiryDate)}</span>
                </div>
                {!showResultsView && totalVotes > 0 && (
                    <button
                        onClick={() => setShowResults(true)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer transition"
                    >
                        <TrendingUp size={11} />
                        View results
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyPolls = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");  // ✅ search state

    const currentUserId =
        JSON.parse(localStorage.getItem("user") || "{}")?.id ||
        JSON.parse(localStorage.getItem("user") || "{}")?._id ||
        null;

    const fetchPolls = async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await axiosInstance.get(API_PATHS.POLLS.GET_ALL_POLLS);
            const data = res?.data?.polls;
            if (Array.isArray(data)) {
                const normalized = data.map((poll) => ({
                    ...poll,
                    options: Array.isArray(poll?.options)
                        ? poll.options.map((opt) =>
                            typeof opt === "string" ? { text: opt, votes: [] } : opt
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

    // ✅ Shimmer + animation inject
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .animate-shimmer { animation: shimmer 1.5s infinite linear; }
            @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .poll-animate { animation: fadeSlideUp 0.35s ease both; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const activeCount = polls.filter((p) => !isExpired(p?.expiry)).length;
    const closedCount = polls.filter((p) => isExpired(p?.expiry)).length;

    const TABS = [
        { label: "All", count: polls.length },
        { label: "Active", count: activeCount },
        { label: "Closed", count: closedCount },
    ];

    // ✅ Filter + Search combined
    const filteredPolls = useMemo(() => {
        return polls.filter((poll) => {
            const expired = isExpired(poll?.expiry);
            const matchesFilter =
                filter === "Active" ? !expired :
                    filter === "Closed" ? expired : true;

            const matchesSearch = poll?.question
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [polls, filter, searchQuery]);

    return (
        <DashboardLayout activeMenu="My Polls">

            {loading ? (
                <MyPollsSkeleton />
            ) : (
                <div className="py-4 md:py-5 space-y-6">

                    {/* ── Header ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                My Polls
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Vote on active polls and view results from your team.
                            </p>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => fetchPolls(true)}
                            disabled={refreshing}
                            className="h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all cursor-pointer disabled:opacity-60 self-start lg:self-auto"
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    {/* ── Search + Tabs — MyTasks jaisa layout ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Search bar — left */}
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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

                    {/* ── Result count ── */}
                    {filteredPolls.length > 0 && (
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-900">{filteredPolls.length}</span>{" "}
                            poll{filteredPolls.length !== 1 ? "s" : ""}
                        </p>
                    )}

                    {/* ── Empty State ── */}
                    {filteredPolls.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                                <Vote size={40} className="text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {searchQuery
                                    ? "No Polls Found 🔍"
                                    : filter === "Active" ? "No Active Polls 🗳️"
                                        : filter === "Closed" ? "No Closed Polls 📋"
                                            : filter !== "All" ? "No Polls Found" : "No Polls Created"
                                }
                            </h3>
                            <p className="text-gray-500 max-w-md mt-3 leading-relaxed">
                                {searchQuery
                                    ? `No polls matched "${searchQuery}". Try different keywords.`
                                    : filter === "active"
                                        ? "There are no active polls right now. Check back later or switch to All Polls."
                                        : filter === "closed"
                                            ? "No polls have been closed yet. Active polls will appear here once they expire."
                                            : "No polls have been created yet. Your admin will create polls for the team soon."
                                }
                            </p>
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-6 h-11 px-6 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer"
                                >
                                    Clear Search
                                </button>
                            ) : filter !== "all" ? (
                                <button
                                    onClick={() => setFilter("All")}
                                    className="mt-6 h-11 px-6 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer"
                                >
                                    View All Polls
                                </button>
                            ) : null}
                        </div>
                    ) : (
                        /* ── Poll Grid ── */
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredPolls.map((poll, idx) => (
                                <div
                                    key={poll._id}
                                    className="poll-animate"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    <PollCard
                                        poll={poll}
                                        currentUserId={currentUserId}
                                        onVote={(updated) => {
                                            setPolls((prev) =>
                                                prev.map((p) => p._id === updated._id ? updated : p)
                                            );
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyPolls;