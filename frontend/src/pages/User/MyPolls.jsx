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

// Updated for Dark Theme / Glassmorphism
const optionColors = [
    { bg: "bg-blue-500", light: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/40", bar: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" },
    { bg: "bg-purple-500", light: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/40", bar: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" },
    { bg: "bg-emerald-500", light: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40", bar: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" },
    { bg: "bg-amber-500", light: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40", bar: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]" },
    { bg: "bg-rose-500", light: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/40", bar: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" },
    { bg: "bg-cyan-500", light: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/40", bar: "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]" },
];
const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const getColor = (i) => optionColors[i % optionColors.length];

// ─── Skeleton (Dark Mode) ─────────────────────────────────────────────────────
const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer border border-white/5 ${className}`} />
);

const PollSkeleton = () => (
    <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <SkeletonBlock className="h-6 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
        </div>
        <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-11 w-full rounded-[1.25rem]" />
            ))}
        </div>
        <div className="h-12 bg-zinc-950/40 border-t border-white/5" />
    </div>
);

const MyPollsSkeleton = () => (
    <div className="py-4 md:py-5 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
                <SkeletonBlock className="h-8 w-32 rounded-lg" />
                <SkeletonBlock className="h-4 w-64 rounded-md" />
            </div>
            <SkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <SkeletonBlock className="h-10 flex-1 max-w-xl rounded-xl" />
            <SkeletonBlock className="h-10 w-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <PollSkeleton key={i} />)}
        </div>
    </div>
);

// ─── Poll Card (Advanced Rounded Developer Style) ─────────────────────────────
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
        <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.15)] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col relative group">
            
            {/* Ambient Glass Orbs for 3D effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />

            {/* Header */}
            <div className="px-5 pt-5 pb-2 relative z-10">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="h-8 w-8 rounded-xl bg-zinc-950/50 flex items-center justify-center border border-white/5 shadow-inner">
                            <BarChart3 size={14} className="text-cyan-400 stroke-[2.5]" />
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-inner ${expired ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                            {expired ? "Closed" : "Active"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-300 shrink-0 bg-zinc-950/50 border border-white/5 px-3 py-1.5 rounded-xl shadow-inner">
                        <Vote size={12} className="text-cyan-400 stroke-[2.5]" />
                        <span>{totalVotes} Votes</span>
                    </div>
                </div>
                <h2 className="text-white font-mono font-black text-sm sm:text-base leading-snug line-clamp-3">
                    {localPoll?.question || "No question"}
                </h2>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 relative z-10 flex flex-col justify-center">

                {!showResultsView ? (

                    <div className="space-y-3">
                        {options.map((opt, i) => {
                            const color = getColor(i);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    disabled={voting}
                                    onClick={() => handleVote(i)}
                                    className={`w-full flex items-center gap-3 rounded-[1.25rem] px-2.5 py-2.5 border transition-all duration-300 text-left cursor-pointer active:scale-[0.98] shadow-inner
                                        ${voting && justVoted === i
                                            ? `${color.light} ${color.border} shadow-[0_0_20px_rgba(56,189,248,0.2)]`
                                            : "bg-zinc-950/50 border-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                        }
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-xl ${color.bg} text-white flex items-center justify-center text-[11px] font-mono font-black shrink-0 shadow-inner`}>
                                        {optionLabels[i]}
                                    </div>
                                    <span className="flex-1 text-xs font-mono text-zinc-300 truncate pr-2">
                                        {opt?.text || "No option"}
                                    </span>
                                    {voting && justVoted === i && (
                                        <Loader2 size={14} className="animate-spin text-cyan-400 shrink-0 mr-2" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                ) : (

                    <div className="space-y-3">
                        {options.map((opt, i) => {
                            const votes = opt?.votes?.length || 0;
                            const pct = getVotePercent(votes, totalVotes);
                            const color = getColor(i);
                            const isLeading = i === leadingIndex && totalVotes > 0;
                            const isMyVote = i === userVotedIndex;

                            return (
                                <div
                                    key={i}
                                    className={`rounded-[1.25rem] border relative overflow-hidden transition-all duration-300 shadow-inner
                                        ${isMyVote ? `${color.border} bg-zinc-950/80` : "border-white/5 bg-zinc-950/40"}
                                    `}
                                >
                                    {/* Main background fill (Opacity based) */}
                                    <div 
                                        className={`absolute inset-y-0 left-0 ${color.light} transition-all duration-1000 ease-out`} 
                                        style={{ width: `${pct}%` }} 
                                    >
                                        {/* Glowing edge on the progress fill */}
                                        <div className={`absolute inset-y-0 right-0 w-1 ${color.bar} opacity-70 blur-[2px]`} />
                                    </div>

                                    <div className="px-2.5 py-2.5 flex items-center gap-3 relative z-10">
                                        <div className={`w-8 h-8 rounded-xl ${color.bg} text-white text-[11px] font-mono font-black flex items-center justify-center shrink-0 shadow-inner`}>
                                            {optionLabels[i]}
                                        </div>

                                        <span className={`flex-1 text-xs font-mono truncate ${isMyVote ? 'text-white font-bold' : 'text-zinc-400'}`}>
                                            {opt?.text || "No option"}
                                        </span>

                                        <div className="flex items-center gap-2 shrink-0 pr-2">
                                            {isLeading && (
                                                <span className="text-[11px]" title="Leading Option">⭐</span>
                                            )}

                                            {isMyVote && (
                                                <CheckCircle2 size={14} className={`${color.text} stroke-[2.5]`} />
                                            )}

                                            <span className={`text-[10px] sm:text-xs font-mono font-black ${isMyVote ? color.text : "text-zinc-500"}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Thin progress bar line at very bottom for extra flair */}
                                    <div className="h-1 w-full bg-zinc-950/50 absolute bottom-0 left-0">
                                        <div
                                            className={`h-full ${color.bar} transition-all duration-1000 ease-out`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {!hasVoted && !expired && (
                            <div className="pt-2">
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-cyan-500/10"
                                >
                                    <span>←</span> Back to voting
                                </button>
                            </div>
                        )}
                    </div>

                )}

            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md relative z-10`}>
                <div className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider ${expired ? "text-rose-400" : "text-cyan-400"}`}>
                    {expired ? <Clock size={12} className="stroke-[2.5]" /> : <CalendarClock size={12} className="stroke-[2.5]" />}
                    <span>{expired ? "Closed " : "Closes "}{formatExpiry(expiryDate)}</span>
                </div>
                {!showResultsView && totalVotes > 0 && (
                    <button
                        onClick={() => setShowResults(true)}
                        className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-cyan-500/10"
                    >
                        <TrendingUp size={12} className="stroke-[2.5]" />
                        Results
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
    const [searchQuery, setSearchQuery] = useState("");

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

    // Shimmer + animation inject
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
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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

    // Filter + Search combined
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
                <div className="py-2 md:py-4 space-y-6">

                    {/* ── Header ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                My Polls
                            </h1>
                            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                                Vote on active polls and view results from your team.
                            </p>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => fetchPolls(true)}
                            disabled={refreshing}
                            className="h-10 px-4 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 text-xs font-mono font-bold transition-all shadow-inner cursor-pointer disabled:opacity-60 self-start lg:self-auto active:scale-95"
                        >
                            <RefreshCw size={14} className={`${refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} stroke-[2.5]`} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    {/* ── Search + Tabs (Clean Layout without Double Cards) ── */}
                    <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">

                        {/* Search bar */}
                        <div className="relative flex-1 max-w-xl shrink-0">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none stroke-[2.5]" />
                            <input
                                type="text"
                                placeholder="Search polls by question..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0 pb-1 sm:pb-0">
                            <div className="min-w-max flex items-center h-11">
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
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 px-1">
                            Showing{" "}
                            <span className="font-bold text-cyan-400">{filteredPolls.length}</span>{" "}
                            poll{filteredPolls.length !== 1 ? "s" : ""}
                        </p>
                    )}

                    {/* ── Empty State ── */}
                    {filteredPolls.length === 0 ? (
                        <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                                <Vote size={32} className="text-cyan-400 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">
                                {searchQuery
                                    ? "No Polls Found"
                                    : filter === "Active" ? "No Active Polls"
                                        : filter === "Closed" ? "No Closed Polls"
                                            : filter !== "All" ? "No Polls Found" : "No Polls Created"
                                }
                            </h3>
                            <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                                {searchQuery
                                    ? `No polls matched "${searchQuery}". Try different keywords.`
                                    : filter === "Active"
                                        ? "There are no active polls right now. Check back later or switch to All Polls."
                                        : filter === "Closed"
                                            ? "No polls have been closed yet. Active polls will appear here once they expire."
                                            : "No polls have been created yet. Your admin will create polls for the team soon."
                                }
                            </p>
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-6 h-10 px-6 rounded-xl border border-white/10 bg-zinc-900/80 text-xs font-mono font-bold text-cyan-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-inner active:scale-95"
                                >
                                    Clear Search
                                </button>
                            ) : filter !== "All" ? (
                                <button
                                    onClick={() => setFilter("All")}
                                    className="mt-6 h-10 px-6 rounded-xl border border-white/10 bg-zinc-900/80 text-xs font-mono font-bold text-cyan-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-inner active:scale-95"
                                >
                                    View All Polls
                                </button>
                            ) : null}
                        </div>
                    ) : (
                        /* ── Poll Grid (Compact up to 4 columns on huge screens) ── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {filteredPolls.map((poll, idx) => (
                                <div
                                    key={poll._id}
                                    className="poll-animate"
                                    style={{ animationDelay: `${idx * 40}ms` }}
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