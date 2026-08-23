import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
    RefreshCw, Search, Sparkles, AlertTriangle, Clock, TrendingUp,
    Users, FolderKanban, ListChecks, Activity, Flame, Award,
    ChevronDown, X, AlertCircle, CheckCircle2, PauseCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext.jsx";
import CustomPieChart from "../../components/Charts/CustomPieChart.jsx";
import CustomBarChart from "../../components/Charts/CustomBarChart.jsx";
import MarkdownMessage from "../../components/Chats/MarkdownMessage.jsx";

const COLORS = ["#38bdf8", "#8b5cf6", "#10b981"];
const RANGE_OPTIONS = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
    { label: "All", value: "all" },
];

// ------------------------------------------------------------------
// Small shared bits
// ------------------------------------------------------------------
const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[1.75rem] sm:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle, accent = "text-cyan-400" }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className={`h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${accent}`}>
            <Icon size={16} className="stroke-[2.5]" />
        </div>
        <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-mono font-black text-white">{title}</h3>
            {subtitle && <p className="text-[10px] sm:text-xs font-mono text-zinc-500">{subtitle}</p>}
        </div>
    </div>
);

const Badge = ({ children, color = "zinc" }) => {
    const map = {
        zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/25",
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/25",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/25",
    };
    return (
        <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${map[color] || map.zinc}`}>
            {children}
        </span>
    );
};

const healthColor = (score) => {
    if (score === null || score === undefined) return "zinc";
    if (score >= 75) return "emerald";
    if (score >= 50) return "amber";
    return "rose";
};

const riskColor = (level) => ({ Critical: "rose", High: "amber", Medium: "cyan" }[level] || "zinc");
const workloadColor = (level) => ({ Overloaded: "rose", Light: "cyan", Balanced: "emerald" }[level] || "zinc");

// ------------------------------------------------------------------
// Lightweight inline SVG trend chart — no extra dependency
// ------------------------------------------------------------------
const TrendChart = ({ data }) => {
    if (!data?.length) return <div className="h-48 flex items-center justify-center text-xs font-mono text-zinc-600">No data in this range</div>;

    const width = 600, height = 190, pad = 24;
    const maxVal = Math.max(1, ...data.map((d) => Math.max(d.created, d.completed)));
    const stepX = (width - pad * 2) / Math.max(1, data.length - 1);
    const scaleY = (v) => height - pad - (v / maxVal) * (height - pad * 2);

    const pathFor = (key) =>
        data.map((d, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${scaleY(d[key])}`).join(" ");

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-48">
                {[0, 0.5, 1].map((f) => (
                    <line key={f} x1={pad} x2={width - pad} y1={pad + f * (height - pad * 2)} y2={pad + f * (height - pad * 2)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                ))}
                <path d={pathFor("created")} fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.8" />
                <path d={pathFor("completed")} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                {data.map((d, i) => (
                    <circle key={`c-${i}`} cx={pad + i * stepX} cy={scaleY(d.completed)} r="2.5" fill="#38bdf8" />
                ))}
            </svg>
            <div className="flex items-center gap-4 mt-2 px-1">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Completed</span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400"><span className="h-2 w-2 rounded-full bg-purple-400" /> Created</span>
            </div>
        </div>
    );
};

// Radial health-score ring
const HealthRing = ({ score, size = 44 }) => {
    if (score === null || score === undefined) {
        return <div className="text-[9px] font-mono text-zinc-600 text-center w-11">No tasks</div>;
    }
    const r = (size - 6) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-white">{score}</span>
        </div>
    );
};

// ------------------------------------------------------------------
// Main page
// ------------------------------------------------------------------
const Insights = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);
    const [range, setRange] = useState("30");
    const [search, setSearch] = useState("");
    const [overdueTab, setOverdueTab] = useState("overdue"); // "overdue" | "stalled"

    const [aiSummary, setAiSummary] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    const fetchInsights = async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            setError("");
            const res = await axiosInstance.get(API_PATHS.INSIGHTS.GET_ADMIN_INSIGHTS(range));
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load insights. Please retry.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAiSummary = async () => {
        setAiLoading(true);
        setAiError("");
        try {
            const res = await axiosInstance.get(API_PATHS.INSIGHTS.GET_AI_SUMMARY(range));
            setAiSummary(res.data?.summary || "");
        } catch (err) {
            setAiError(err?.response?.data?.message || "Couldn't generate AI insights right now.");
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => { fetchInsights(); /* eslint-disable-next-line */ }, [range]);

    const pieData = useMemo(() => {
        const t = data?.overallTaskAnalytics;
        return [
            { status: "Pending", count: t?.pending || 0 },
            { status: "In Progress", count: t?.inProgress || 0 },
            { status: "Completed", count: t?.completed || 0 },
        ];
    }, [data]);

    const barData = useMemo(() => {
        const p = data?.overallTaskAnalytics?.priorityBreakdown;
        return [
            { priority: "Low", count: p?.Low || 0 },
            { priority: "Medium", count: p?.Medium || 0 },
            { priority: "High", count: p?.High || 0 },
        ];
    }, [data]);

    const q = search.trim().toLowerCase();
    const filteredProjects = useMemo(() => {
        if (!data?.projectsPerformance) return [];
        if (!q) return data.projectsPerformance;
        return data.projectsPerformance.filter((p) =>
            p.name?.toLowerCase().includes(q) ||
            p.projectCode?.toLowerCase().includes(q) ||
            p.projectLead?.name?.toLowerCase().includes(q)
        );
    }, [data, q]);

    const filteredMembers = useMemo(() => {
        if (!data?.memberStats) return [];
        if (!q) return data.memberStats;
        return data.memberStats.filter((m) =>
            m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
        );
    }, [data, q]);

    const filteredOverdue = useMemo(() => {
        const list = overdueTab === "overdue" ? data?.overdueTasks : data?.stalledTasks;
        if (!list) return [];
        if (!q) return list;
        return list.filter((t) => t.title?.toLowerCase().includes(q));
    }, [data, q, overdueTab]);

    if (loading) {
        return (
            <DashboardLayout activeMenu="Insights">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <SkeletonBlock className="h-9 w-56 rounded-xl" />
                        <SkeletonBlock className="h-10 w-40 rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => <SkeletonBlock key={i} className="h-24 rounded-2xl" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SkeletonBlock className="h-64 rounded-[2rem]" />
                        <SkeletonBlock className="h-64 rounded-[2rem]" />
                    </div>
                    <SkeletonBlock className="h-80 rounded-[2rem]" />
                </div>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} .animate-shimmer{animation:shimmer 2s infinite linear}`}</style>
            </DashboardLayout>
        );
    }

    const t = data?.overallTaskAnalytics || {};

    return (
        <DashboardLayout activeMenu="Insights">
            <div className="space-y-5 sm:space-y-6">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                            <Activity size={24} className="text-cyan-400" />
                            Insights
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/25 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase">Admin</span>
                        </h1>
                        <p className="text-[11px] sm:text-sm font-mono text-zinc-400 mt-1">
                            {data?.teamName ? `${data.teamName} — ${data.totalMembers} member${data.totalMembers === 1 ? "" : "s"}` : "Team analytics"}
                            {data?.generatedAt && ` · Updated ${moment(data.generatedAt).fromNow()}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects, members, tasks..."
                                className="w-full sm:w-64 h-10 pl-9 pr-8 rounded-2xl bg-zinc-900/80 border border-white/10 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20 outline-none text-xs font-mono text-white placeholder-zinc-600 transition-all"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer">
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Range selector */}
                        <div className="flex items-center gap-1 bg-zinc-900/80 border border-white/10 rounded-2xl p-1">
                            {RANGE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setRange(opt.value)}
                                    className={`px-3 h-8 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${range === opt.value ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-zinc-500 hover:text-white"}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => fetchInsights(true)}
                            disabled={refreshing}
                            className="h-10 w-10 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-cyan-500/30 hover:text-cyan-300 text-zinc-400 flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0"
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-rose-400 shrink-0" />
                            <p className="text-xs font-mono font-bold text-rose-300">{error}</p>
                        </div>
                        <button onClick={() => fetchInsights()} className="h-9 px-4 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold cursor-pointer">Retry</button>
                    </div>
                )}

                {/* ============ OVERALL TASK ANALYTICS — stat tiles ============ */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[
                        { label: "Total Tasks", value: t.total, icon: ListChecks, color: "cyan" },
                        { label: "Completion Rate", value: `${t.completionRate || 0}%`, icon: TrendingUp, color: "emerald" },
                        { label: "Overdue", value: t.overdue, icon: AlertTriangle, color: "rose" },
                        { label: "Active Projects", value: data?.activeProjectsCount, icon: FolderKanban, color: "purple" },
                        { label: "Team Members", value: data?.totalMembers, icon: Users, color: "indigo" },
                        {
                            label: "Avg. Completion",
                            value: t.avgCompletionHoursEstimated ? `${t.avgCompletionHoursEstimated}h~` : "—",
                            icon: Clock, color: "amber",
                        },
                    ].map((tile) => (
                        <Card key={tile.label} className="p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-${tile.color}-500/10 border border-${tile.color}-500/25 flex items-center justify-center shrink-0`}>
                                    <tile.icon size={17} className={`text-${tile.color}-400 stroke-[2.5]`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] sm:text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider truncate">{tile.label}</p>
                                    <h4 className="text-sm sm:text-lg font-mono font-black text-white mt-0.5">{tile.value ?? 0}</h4>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* ============ Charts: distribution + priority + trend ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <Card className="p-5 sm:p-6">
                        <SectionTitle icon={ListChecks} title="Task Distribution" accent="text-cyan-400" />
                        <CustomPieChart data={pieData} colors={COLORS} />
                    </Card>
                    <Card className="p-5 sm:p-6">
                        <SectionTitle icon={Flame} title="Priority Breakdown" accent="text-purple-400" />
                        <CustomBarChart data={barData} />
                    </Card>
                    <Card className="p-5 sm:p-6">
                        <SectionTitle icon={TrendingUp} title="Completion Trend" subtitle="Estimated — based on last update time" accent="text-emerald-400" />
                        <TrendChart data={data?.completionTrends || []} />
                    </Card>
                </div>

                {/* ============ Bottleneck banner ============ */}
                {data?.bottleneckProject && data.bottleneckProject.totalTasks > 0 && data.bottleneckProject.overdueTasks > 0 && (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap">
                        <Flame size={20} className="text-rose-400 shrink-0" />
                        <p className="text-xs sm:text-sm font-mono text-rose-200">
                            <span className="font-black">Bottleneck detected:</span>{" "}
                            <span className="font-bold text-white">{data.bottleneckProject.name}</span> has{" "}
                            <span className="font-bold">{data.bottleneckProject.overdueTasks}</span> of{" "}
                            {data.bottleneckProject.totalTasks} tasks overdue — worth checking in on.
                        </p>
                    </div>
                )}

                {/* ============ Projects Performance + Health Score ============ */}
                <Card className="p-5 sm:p-6 md:p-8">
                    <SectionTitle icon={FolderKanban} title="All Projects Performance" subtitle="Health score = 70% completion + 30% on-time weighting" accent="text-purple-400" />
                    {filteredProjects.length === 0 ? (
                        <p className="text-xs font-mono text-zinc-500 py-6 text-center">No projects match.</p>
                    ) : (
                        <div className="space-y-3">
                            {filteredProjects.map((p) => (
                                <div
                                    key={p._id}
                                    onClick={() => navigate(`/admin/projects/${p._id}`)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-purple-500/25 hover:bg-zinc-900/70 transition-all cursor-pointer flex-wrap sm:flex-nowrap"
                                >
                                    <HealthRing score={p.healthScore} />
                                    <div className="flex-1 min-w-[160px]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs sm:text-sm font-mono font-bold text-white truncate">{p.name}</p>
                                            <Badge color="zinc">{p.projectCode}</Badge>
                                            <Badge color={p.status === "Active" ? "emerald" : p.status === "On Hold" ? "amber" : "zinc"}>{p.status}</Badge>
                                            {p.isOverdueProject && <Badge color="rose">Overdue</Badge>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden max-w-xs">
                                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">{p.completedTasks}/{p.totalTasks} tasks</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 shrink-0">
                                        <span>{p.projectLead?.name || "No lead"}</span>
                                        <span>{p.memberCount} members</span>
                                        {p.overdueTasks > 0 && <span className="text-rose-400 font-bold">{p.overdueTasks} overdue</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* ============ Team Productivity + Member Workload ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <Card className="lg:col-span-2 p-5 sm:p-6 md:p-8">
                        <SectionTitle icon={Users} title="Team Productivity & Workload" subtitle={`Active tasks: ≤2 Light · ≥8 Overloaded`} accent="text-indigo-400" />
                        {filteredMembers.length === 0 ? (
                            <p className="text-xs font-mono text-zinc-500 py-6 text-center">No members match.</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {filteredMembers.map((m) => (
                                    <div key={m._id} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            {m.profileImageUrl ? (
                                                <img src={m.profileImageUrl} className="h-9 w-9 rounded-xl object-cover border border-white/10" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                                                    {m.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-mono font-bold text-white truncate">{m.name}</p>
                                                <p className="text-[10px] font-mono text-zinc-500 truncate">{m.role}</p>
                                            </div>
                                            <Badge color={workloadColor(m.workloadLevel)}>{m.workloadLevel}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-zinc-500">
                                            <span>{m.activeTasks} active</span>
                                            <span>{m.completedInRange} done ({RANGE_OPTIONS.find(r => r.value === range)?.label})</span>
                                            {m.overdueAssigned > 0 && <span className="text-rose-400 font-bold">{m.overdueAssigned} overdue</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-5 sm:p-6 md:p-8">
                        <SectionTitle icon={Award} title="Top Performers" accent="text-amber-400" />
                        {(!data?.topPerformers || data.topPerformers.length === 0) ? (
                            <p className="text-xs font-mono text-zinc-500 py-6 text-center">No completions in this range yet.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {data.topPerformers.map((m, i) => (
                                    <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                                        <span className="text-xs font-mono font-black text-amber-400 w-4">#{i + 1}</span>
                                        {m.profileImageUrl ? (
                                            <img src={m.profileImageUrl} className="h-8 w-8 rounded-lg object-cover" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-[11px] font-black text-white">{m.name?.charAt(0)}</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-mono font-bold text-white truncate">{m.name}</p>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-emerald-400">{m.completedInRange}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* ============ Overdue & Stalled + Deadline Risks ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    <Card className="p-5 sm:p-6 md:p-8">
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                            <SectionTitle icon={AlertTriangle} title="Overdue & Stalled Tasks" accent="text-rose-400" />
                            <div className="flex items-center gap-1 bg-zinc-900/80 border border-white/10 rounded-xl p-1">
                                <button onClick={() => setOverdueTab("overdue")} className={`px-3 h-7 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${overdueTab === "overdue" ? "bg-rose-500/15 text-rose-300" : "text-zinc-500"}`}>
                                    Overdue ({data?.overdueTasks?.length || 0})
                                </button>
                                <button onClick={() => setOverdueTab("stalled")} className={`px-3 h-7 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${overdueTab === "stalled" ? "bg-amber-500/15 text-amber-300" : "text-zinc-500"}`}>
                                    Stalled ({data?.stalledTasks?.length || 0})
                                </button>
                            </div>
                        </div>
                        {overdueTab === "stalled" && (
                            <p className="text-[10px] font-mono text-zinc-600 -mt-3 mb-3">Heuristic: In Progress, 0% checklist done, untouched 3+ days.</p>
                        )}
                        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {filteredOverdue.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-6 text-center flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Nothing here — good shape.</p>
                            ) : filteredOverdue.map((task) => (
                                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-mono font-bold text-white truncate">{task.title}</p>
                                        <p className="text-[10px] font-mono text-zinc-500 truncate">
                                            {task.project?.name || "Standalone"} · {(task.assignedTo || []).map((a) => a.name).join(", ") || "Unassigned"}
                                        </p>
                                    </div>
                                    <Badge color={task.priority === "High" ? "rose" : task.priority === "Medium" ? "amber" : "zinc"}>{task.priority}</Badge>
                                    <span className="text-[10px] font-mono font-bold text-rose-400 shrink-0">
                                        {overdueTab === "overdue" ? `${task.daysOverdue}d late` : `${task.daysStalled}d stale`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5 sm:p-6 md:p-8">
                        <SectionTitle icon={Clock} title="Deadline Risks" subtitle="Next 7 days, not yet completed" accent="text-amber-400" />
                        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {(data?.deadlineRisks || []).length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-6 text-center">No upcoming deadlines this week.</p>
                            ) : data.deadlineRisks
                                .filter((t) => !q || t.title?.toLowerCase().includes(q))
                                .map((task) => (
                                    <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-mono font-bold text-white truncate">{task.title}</p>
                                            <p className="text-[10px] font-mono text-zinc-500 truncate">{task.project?.name || "Standalone"}</p>
                                        </div>
                                        <Badge color={riskColor(task.riskLevel)}>{task.riskLevel}</Badge>
                                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                                            {task.daysUntil === 0 ? "Today" : `${task.daysUntil}d left`}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </Card>
                </div>

                {/* ============ Team Activity + Skill Coverage ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <Card className="lg:col-span-2 p-5 sm:p-6 md:p-8">
                        <SectionTitle icon={Activity} title="Team Activity" accent="text-cyan-400" />
                        <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                            {(data?.teamActivity || []).length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-6 text-center">No recent activity.</p>
                            ) : data.teamActivity.map((a, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        {a.type?.includes("completed") ? <CheckCircle2 size={12} className="text-emerald-400" /> :
                                            a.type?.includes("overdue") || a.type?.includes("blocked") ? <PauseCircle size={12} className="text-rose-400" /> :
                                                <Activity size={12} className="text-zinc-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-mono text-zinc-300">{a.message}</p>
                                        <p className="text-[9px] font-mono text-zinc-600">{a.projectName} · {moment(a.createdAt).fromNow()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5 sm:p-6 md:p-8">
                        <SectionTitle icon={Sparkles} title="Skill Coverage" accent="text-purple-400" />
                        <div className="flex flex-wrap gap-2">
                            {(data?.skillCoverage || []).length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500">No skills listed yet.</p>
                            ) : data.skillCoverage.map((s) => (
                                <span key={s.skill} className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-900/70 border border-white/10 rounded-full px-3 py-1.5">
                                    {s.skill} <span className="text-purple-400">×{s.count}</span>
                                </span>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ============ AI-Generated Insights ============ */}
                <Card className="p-5 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <SectionTitle icon={Sparkles} title="AI-Generated Insights" subtitle="Summarized from the metrics above" accent="text-cyan-400" />
                        <button
                            onClick={fetchAiSummary}
                            disabled={aiLoading}
                            className="h-9 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                            {aiLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                            {aiSummary ? "Regenerate" : "Generate"}
                        </button>
                    </div>

                    {aiError && <p className="text-xs font-mono font-bold text-rose-400 mb-3">{aiError}</p>}

                    {aiLoading ? (
                        <div className="space-y-3">
                            <SkeletonBlock className="h-4 w-1/3 rounded" />
                            <SkeletonBlock className="h-3 w-full rounded" />
                            <SkeletonBlock className="h-3 w-5/6 rounded" />
                            <SkeletonBlock className="h-3 w-2/3 rounded" />
                        </div>
                    ) : aiSummary ? (
                        <MarkdownMessage content={aiSummary} />
                    ) : (
                        <p className="text-xs font-mono text-zinc-500">Click "Generate" to get an AI-written highlights / risks / recommendations summary for your team.</p>
                    )}
                </Card>

            </div>

            <style>{`
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
                .custom-scrollbar::-webkit-scrollbar { width:5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
            `}</style>
        </DashboardLayout>
    );
};

export default Insights;