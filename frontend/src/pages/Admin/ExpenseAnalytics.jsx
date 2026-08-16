// src/pages/Admin/ExpenseAnalytics.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODE_ICON, formatCurrency, MONTH_NAMES, fmtDate } from "../../utils/expenseConstants.js";
import {
    Plus, RefreshCcw, ChevronLeft, ChevronRight, X, Pencil, Trash2,
    Wallet, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Target, TrendingUp,
    Receipt, BarChart3, PieChart as PieIcon, CreditCard, ArrowUpRight, ArrowDownRight,
    Download, Users, Lightbulb, Gauge, CalendarDays, ListFilter, Trophy,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const Skeleton = () => (
    <div className="space-y-5 animate-pulse">
        <SkeletonBlock className="h-16 rounded-[2rem]" />
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-[76px] rounded-2xl w-full" />)}
        </div>
        <SkeletonBlock className="h-72 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonBlock className="h-72 rounded-[2.5rem]" />
            <SkeletonBlock className="h-72 rounded-[2.5rem]" />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DONUT_COLORS = ["#38bdf8", "#a855f7", "#fbbf24", "#34d399", "#f43f5e", "#06b6d4", "#ec4899", "#84cc16", "#6366f1", "#71717a"];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pctChange = (curr, prev) => {
    if (!prev) return null;
    return Math.round(((curr - prev) / prev) * 100);
};

const daysInMonth = (year, month1Indexed) => new Date(year, month1Indexed, 0).getDate();

const computeWeekdayData = (expenses) => {
    const totals = Array(7).fill(0);
    expenses.forEach((e) => {
        const d = new Date(e.date);
        if (Number.isNaN(d.getTime())) return;
        const day = d.getDay(); // 0 = Sun ... 6 = Sat
        const idx = day === 0 ? 6 : day - 1; // remap to Mon=0 ... Sun=6
        totals[idx] += e.amount || 0;
    });
    return WEEKDAY_LABELS.map((label, i) => ({ label, total: totals[i] }));
};

const computeTopVendors = (expenses) => {
    const map = {};
    expenses.forEach((e) => {
        const v = (e.vendor || "").trim();
        if (!v) return;
        map[v] = (map[v] || 0) + (e.amount || 0);
    });
    return Object.entries(map)
        .map(([vendor, total]) => ({ vendor, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
};

// ─────────────────────────────────────────────────────────────────────────────
// DELTA CHIP (MoM style up/down indicator)
// ─────────────────────────────────────────────────────────────────────────────

const DeltaChip = ({ value, invert = false }) => {
    if (value === null || value === undefined || Number.isNaN(value)) return null;
    const isUp = value > 0;
    const isGood = invert ? !isUp : isUp;
    if (value === 0) {
        return <span className="text-[10px] font-mono font-bold text-zinc-500">No change</span>;
    }
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold ${isGood ? "text-rose-400" : "text-emerald-400"}`}>
            {isUp ? <ArrowUpRight size={11} className="stroke-[3]" /> : <ArrowDownRight size={11} className="stroke-[3]" />}
            {Math.abs(value)}%
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE MONTHLY TREND (line + area, hover tooltip, gridlines)
// ─────────────────────────────────────────────────────────────────────────────

const TrendChart = ({ trend }) => {
    const containerRef = useRef(null);
    const [hoverIndex, setHoverIndex] = useState(null);

    const w = 700;
    const h = 220;
    const padY = 18;
    const max = Math.max(1, ...trend.map((t) => t.total));
    const n = trend.length;

    const points = useMemo(() => trend.map((t, i) => {
        const x = n > 1 ? (i * w) / (n - 1) : w / 2;
        const y = padY + (h - padY * 2) * (1 - t.total / max);
        return { x, y, ...t };
    }), [trend, n, max]);

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const areaPath = points.length
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${h} L ${points[0].x.toFixed(1)} ${h} Z`
        : "";

    const handleMove = (e) => {
        if (!containerRef.current || n === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const frac = Math.min(1, Math.max(0, relX / rect.width));
        const idx = n > 1 ? Math.round(frac * (n - 1)) : 0;
        setHoverIndex(idx);
    };

    const hovered = hoverIndex !== null ? points[hoverIndex] : null;
    const prevHovered = hoverIndex !== null && hoverIndex > 0 ? points[hoverIndex - 1] : null;
    const hoveredDelta = hovered && prevHovered ? pctChange(hovered.total, prevHovered.total) : null;

    return (
        <div
            ref={containerRef}
            className="relative w-full select-none"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
        >
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56 overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1="0" x2={w} y1={padY + (h - padY * 2) * f} y2={padY + (h - padY * 2) * f}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                ))}
                {areaPath && <path d={areaPath} fill="url(#trendFill)" />}
                {linePath && <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                {hovered && (
                    <line x1={hovered.x} x2={hovered.x} y1="0" y2={h} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                )}
                {points.map((p, i) => (
                    <circle key={`${p.year}-${p.month}`} cx={p.x} cy={p.y} r={hoverIndex === i ? 6 : 3.5}
                        fill={hoverIndex === i ? "#0891b2" : "#38bdf8"} stroke="#09090b" strokeWidth="2"
                        className="transition-all duration-150" />
                ))}
            </svg>

            <div className="flex justify-between mt-2 px-0.5">
                {trend.map((t, i) => (
                    <span key={`${t.year}-${t.month}`} className={`text-[11px] font-mono font-bold transition-colors ${hoverIndex === i ? "text-cyan-400" : "text-zinc-500"}`}>
                        {MONTH_NAMES[t.month - 1].slice(0, 3)}
                    </span>
                ))}
            </div>

            {hovered && (
                <div
                    className="absolute -top-2 pointer-events-none bg-zinc-950/95 backdrop-blur-xl text-white text-xs px-3.5 py-2 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20 whitespace-nowrap"
                    style={{ left: `${(hovered.x / w) * 100}%`, transform: "translate(-50%, -100%)" }}
                >
                    <p className="font-mono font-bold text-zinc-300">{MONTH_NAMES[hovered.month - 1]} {hovered.year}</p>
                    <p className="flex items-center gap-2 mt-0.5 font-mono font-black text-cyan-400">
                        {formatCurrency(hovered.total)}
                        {hoveredDelta !== null && <DeltaChip value={hoveredDelta} />}
                    </p>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE CATEGORY DONUT
// ─────────────────────────────────────────────────────────────────────────────

const DonutChart = ({ data }) => {
    const [hoverIdx, setHoverIdx] = useState(null);
    const total = data.reduce((s, d) => s + d.total, 0) || 1;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offsetAcc = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
                <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90 overflow-visible">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
                    {data.map((d, i) => {
                        const frac = d.total / total;
                        const dash = frac * circumference;
                        const gap = circumference - dash;
                        const el = (
                            <circle key={d._id} cx="80" cy="80" r={radius} fill="none"
                                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                                strokeWidth={hoverIdx === i ? 22 : 18}
                                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offsetAcc}
                                strokeLinecap="butt" className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHoverIdx(i)}
                                onMouseLeave={() => setHoverIdx(null)} />
                        );
                        offsetAcc += dash;
                        return el;
                    })}
                    <circle cx="80" cy="80" r="42" fill="#09090b" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                    <p className="text-[10px] font-mono text-zinc-500 font-bold truncate max-w-full">
                        {hoverIdx !== null ? data[hoverIdx]._id : "Total"}
                    </p>
                    <p className="text-xs font-mono font-black text-white truncate max-w-full mt-0.5">
                        {formatCurrency(hoverIdx !== null ? data[hoverIdx].total : total)}
                    </p>
                </div>
            </div>
            <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {data.map((d, i) => (
                    <div key={d._id}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                        className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 -mx-2 transition-colors cursor-default ${hoverIdx === i ? "bg-zinc-900/80 border border-white/5" : ""}`}>
                        <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="text-xs font-mono text-zinc-300 truncate flex-1">{d._id}</span>
                        <span className="text-[11px] font-mono text-zinc-500 shrink-0">{Math.round((d.total / total) * 100)}%</span>
                        <span className="text-xs font-mono font-bold text-white shrink-0 w-24 text-right">{formatCurrency(d.total)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY BAR CHART (alternate view)
// ─────────────────────────────────────────────────────────────────────────────

const CategoryBarChart = ({ data }) => {
    const max = Math.max(1, ...data.map((d) => d.total));
    const total = data.reduce((s, d) => s + d.total, 0) || 1;
    return (
        <div className="space-y-3.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {data.map((d, i) => (
                <div key={d._id}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-xs font-mono text-zinc-300 truncate">
                            <span className="h-2 w-2 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            <span className="truncate">{d._id}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-white shrink-0 ml-2">
                            {formatCurrency(d.total)} <span className="text-zinc-500 font-normal">· {Math.round((d.total / total) * 100)}%</span>
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-900 border border-white/5 overflow-hidden shadow-inner">
                        <div className="h-2 rounded-full transition-all duration-700 shadow-inner"
                            style={{ width: `${(d.total / max) * 100}%`, backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// WEEKDAY SPENDING PATTERN
// ─────────────────────────────────────────────────────────────────────────────

const WeekdayChart = ({ data }) => {
    const max = Math.max(1, ...data.map((d) => d.total));
    const peak = data.reduce((best, d) => (d.total > best.total ? d : best), data[0]);
    return (
        <>
            <div className="flex items-end gap-2 sm:gap-3 h-40 pt-4">
                {data.map((d) => {
                    const pct = Math.max(2, Math.round((d.total / max) * 100));
                    const isPeak = peak && d.label === peak.label && d.total > 0;
                    return (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                            <div className="relative w-full flex-1 flex items-end justify-center">
                                <div title={`${d.label}: ${formatCurrency(d.total)}`}
                                    className={`w-full max-w-[30px] rounded-t-xl transition-all duration-500 cursor-default shadow-inner
                                        ${isPeak ? "bg-gradient-to-t from-cyan-600 to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "bg-zinc-900 border border-white/5 group-hover:bg-zinc-800"}`}
                                    style={{ height: `${pct}%` }} />
                            </div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider ${isPeak ? "text-cyan-400 font-bold" : "text-zinc-500"}`}>{d.label}</span>
                        </div>
                    );
                })}
            </div>
            {peak && peak.total > 0 && (
                <p className="text-xs font-mono text-zinc-400 mt-3 text-center">
                    You spend the most on <span className="font-bold text-white">{peak.label}days</span>
                </p>
            )}
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYTICS PAGE
// ─────────────────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "12M", months: 12 },
];

const ExpenseAnalytics = () => {
    const today = new Date();

    const [summary, setSummary] = useState(null);
    const [trend, setTrend] = useState([]);
    const [categoryAll, setCategoryAll] = useState([]);
    const [categoryMonth, setCategoryMonth] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [trendMonths, setTrendMonths] = useState(6);
    const [categoryScope, setCategoryScope] = useState("month"); // "month" | "all"
    const [categoryView, setCategoryView] = useState("donut"); // "donut" | "bar"

    const fetchAll = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            const [sumRes, trendRes, catAllRes, catMonthRes, expRes, budRes] = await Promise.allSettled([
                axiosInstance.get(API_PATHS.EXPENSES.SUMMARY),
                axiosInstance.get(`${API_PATHS.EXPENSES.MONTHLY_TREND}?months=${trendMonths}`),
                axiosInstance.get(API_PATHS.EXPENSES.BY_CATEGORY),
                axiosInstance.get(`${API_PATHS.EXPENSES.BY_CATEGORY}?month=${month}&year=${year}`),
                axiosInstance.get(API_PATHS.EXPENSES.GET_ALL),
                axiosInstance.get(`${API_PATHS.BUDGETS.GET_ALL}?month=${month}&year=${year}`),
            ]);

            if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
            if (trendRes.status === "fulfilled") setTrend(trendRes.value.data?.trend || []);
            if (catAllRes.status === "fulfilled") setCategoryAll(catAllRes.value.data?.breakdown || []);
            if (catMonthRes.status === "fulfilled") setCategoryMonth(catMonthRes.value.data?.breakdown || []);
            if (expRes.status === "fulfilled") {
                const raw = expRes.value.data?.expenses || expRes.value.data || [];
                setExpenses(Array.isArray(raw) ? raw : []);
            }
            if (budRes.status === "fulfilled") setBudgets(budRes.value.data?.budgets || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [trendMonths]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const topExpenses = useMemo(() => expenses.slice().sort((a, b) => b.amount - a.amount).slice(0, 5), [expenses]);
    const topVendors = useMemo(() => computeTopVendors(expenses), [expenses]);
    const weekdayData = useMemo(() => computeWeekdayData(expenses), [expenses]);
    const categoryData = categoryScope === "month" ? categoryMonth : categoryAll;
    const hasData = expenses.length > 0;

    const highestSingle = topExpenses[0] || null;
    const highestCategory = categoryAll[0] || null;

    // ── Derived analytics ───────────────────────────────────────────────────
    const momChange = useMemo(() => pctChange(summary?.thisMonth, summary?.lastMonth), [summary]);

    const dayOfMonth = today.getDate();
    const totalDaysThisMonth = daysInMonth(today.getFullYear(), today.getMonth() + 1);
    const avgPerDay = summary?.thisMonth ? summary.thisMonth / dayOfMonth : 0;
    const projectedMonthEnd = avgPerDay * totalDaysThisMonth;

    const totalBudget = useMemo(() => budgets.reduce((s, b) => s + (b.amount || 0), 0), [budgets]);
    const totalBudgetSpent = useMemo(() => budgets.reduce((s, b) => s + (b.spent || 0), 0), [budgets]);
    const budgetPct = totalBudget ? Math.round((totalBudgetSpent / totalBudget) * 100) : 0;
    const budgetStatus = !totalBudget ? null : budgetPct >= 100 ? "Over Budget" : budgetPct >= 80 ? "Near Limit" : "On Track";
    const budgetStatusColor = budgetStatus === "Over Budget" ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
        : budgetStatus === "Near Limit" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    const budgetBarColor = budgetStatus === "Over Budget" ? "bg-rose-500" : budgetStatus === "Near Limit" ? "bg-amber-500" : "bg-emerald-500";

    const insightText = useMemo(() => {
        if (!hasData) return null;
        const parts = [];
        if (momChange !== null) {
            parts.push(momChange > 0
                ? `You've spent ${momChange}% more than last month.`
                : momChange < 0
                    ? `You've spent ${Math.abs(momChange)}% less than last month — nice work.`
                    : `Your spending is flat compared to last month.`);
        }
        if (highestCategory) {
            const share = Math.round((highestCategory.total / (summary?.total || highestCategory.total)) * 100);
            parts.push(`${highestCategory._id} is your biggest category at ${share}% of total spend.`);
        }
        if (totalBudget && budgetStatus === "Over Budget") {
            parts.push(`You're over your set budget for ${MONTH_NAMES[today.getMonth()]}.`);
        } else if (avgPerDay > 0) {
            parts.push(`At the current pace, you're projected to spend ${formatCurrency(projectedMonthEnd)} by month end.`);
        }
        return parts.join(" ");
    }, [hasData, momChange, highestCategory, summary, totalBudget, budgetStatus, avgPerDay, projectedMonthEnd, today]);

    // ── Export ───────────────────────────────────────────────────────────────
    const exportReport = () => {
        const rows = [];
        rows.push(["Expense Analytics Report", fmtDate(today)]);
        rows.push([]);
        rows.push(["Summary"]);
        rows.push(["Total Spent", summary?.total ?? 0]);
        rows.push(["This Month", summary?.thisMonth ?? 0]);
        rows.push(["Last Month", summary?.lastMonth ?? 0]);
        rows.push(["Avg / Day (This Month)", Math.round(avgPerDay)]);
        rows.push(["Projected Month End", Math.round(projectedMonthEnd)]);
        rows.push([]);
        rows.push(["Category Breakdown (All Time)"]);
        rows.push(["Category", "Amount"]);
        categoryAll.forEach((c) => rows.push([c._id, c.total]));
        rows.push([]);
        rows.push(["Monthly Trend"]);
        rows.push(["Month", "Amount"]);
        trend.forEach((t) => rows.push([`${MONTH_NAMES[t.month - 1]} ${t.year}`, t.total]));
        rows.push([]);
        rows.push(["Top Vendors"]);
        rows.push(["Vendor", "Amount"]);
        topVendors.forEach((v) => rows.push([v.vendor, v.total]));
        rows.push([]);
        rows.push(["Budgets"]);
        rows.push(["Category", "Budget", "Spent", "Status"]);
        budgets.forEach((b) => rows.push([b.category, b.amount, b.spent, b.status]));

        const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const p = (n) => String(n).padStart(2, "0");
        a.download = `expense-analytics-${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Style injections for scrollbars and animations
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .animate-shimmer { animation: shimmer 2s infinite linear; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn .2s ease; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <DashboardLayout activeMenu="Expenses Analytics">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Expense Analytics</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Spending trends, category breakdowns and budget performance</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button type="button" onClick={exportReport} disabled={loading || !hasData}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 hover:text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <Download size={16} className="text-cyan-400 stroke-[2.5]" />
                            <span className="hidden sm:inline">Export Report</span>
                        </button>
                        <button type="button" onClick={() => fetchAll({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? <Skeleton /> : !hasData ? (
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <BarChart3 size={36} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">No data to analyze yet</h3>
                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                            Once you start logging expenses, trends and breakdowns will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* INSIGHT BANNER */}
                        {insightText && (
                            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 sm:p-6 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex items-start gap-4">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner relative z-10 mt-0.5">
                                    <Lightbulb size={18} className="stroke-[2.5]" />
                                </div>
                                <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed relative z-10 pt-2">{insightText}</p>
                            </div>
                        )}

                        {/* STAT CARDS (Responsive: Stacked line-by-line on mobile, grid on desktop) */}
                        <div className="flex flex-col sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-blue-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Wallet size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Total Spent</p>
                                    <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(summary?.total)}</p>
                                </div>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-indigo-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><TrendingUp size={16} /></div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">This Month</p>
                                        <DeltaChip value={momChange} />
                                    </div>
                                    <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(summary?.thisMonth)}</p>
                                </div>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-teal-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Gauge size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Avg / Day</p>
                                    <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(Math.round(avgPerDay))}</p>
                                </div>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-purple-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><PieIcon size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Top Category</p>
                                    <p className="text-sm font-mono font-bold text-white mt-0.5 truncate">{highestCategory?._id || "—"}</p>
                                </div>
                            </div>
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-amber-500/20 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden col-span-2 sm:col-span-1">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 border border-white/5 flex items-center justify-center shrink-0 shadow-inner"><Trophy size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">Highest Expense</p>
                                    <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{formatCurrency(highestSingle?.amount)}</p>
                                </div>
                            </div>
                        </div>

                        {/* BUDGET HEALTH */}
                        {totalBudget > 0 && (
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                                            <Gauge size={18} className="stroke-[2.5]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-mono font-bold text-white tracking-wide">Budget Health</h3>
                                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()} · {formatCurrency(totalBudgetSpent)} of {formatCurrency(totalBudget)} used</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border shadow-inner self-start sm:self-auto ${budgetStatusColor}`}>
                                        {budgetStatus}
                                    </span>
                                </div>
                                <div className="h-2.5 rounded-full bg-zinc-900 border border-white/5 overflow-hidden shadow-inner">
                                    <div className={`h-2.5 rounded-full ${budgetBarColor} transition-all duration-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                                </div>
                                <div className="flex items-center justify-between mt-2.5">
                                    <span className="text-xs font-mono text-zinc-400">{budgetPct}% used</span>
                                    <span className="text-xs font-mono text-zinc-400">{formatCurrency(Math.max(totalBudget - totalBudgetSpent, 0))} remaining</span>
                                </div>
                            </div>
                        )}

                        {/* MONTHLY TREND */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                                        <BarChart3 size={18} className="stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Monthly Spending Trend</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1 shadow-inner">
                                    {RANGE_OPTIONS.map((opt) => (
                                        <button key={opt.label} type="button" onClick={() => setTrendMonths(opt.months)}
                                            className={`cursor-pointer px-3 h-8 rounded-lg text-xs font-mono font-bold transition-all
                                                ${trendMonths === opt.months ? "bg-zinc-950 text-cyan-400 shadow-sm border border-white/10" : "text-zinc-400 hover:text-white"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <TrendChart trend={trend} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* CATEGORY BREAKDOWN */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
                                            <PieIcon size={18} className="stroke-[2.5]" />
                                        </div>
                                        <h3 className="text-sm font-mono font-bold text-white tracking-wide">Category Breakdown</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1 shadow-inner">
                                            {[{ key: "month", label: "This Month" }, { key: "all", label: "All Time" }].map((opt) => (
                                                <button key={opt.key} type="button" onClick={() => setCategoryScope(opt.key)}
                                                    className={`cursor-pointer px-3 h-8 rounded-lg text-xs font-mono font-bold transition-all
                                                        ${categoryScope === opt.key ? "bg-zinc-950 text-cyan-400 shadow-sm border border-white/10" : "text-zinc-400 hover:text-white"}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => setCategoryView((v) => (v === "donut" ? "bar" : "donut"))}
                                            title="Toggle chart view"
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center transition shadow-inner">
                                            {categoryView === "donut" ? <BarChart3 size={16} /> : <PieIcon size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {categoryData.length === 0 ? (
                                    <div className="border border-dashed border-white/10 rounded-2xl py-10 text-center bg-zinc-900/20">
                                        <p className="text-xs font-mono text-zinc-400">No spend in this period</p>
                                    </div>
                                ) : categoryView === "donut" ? (
                                    <DonutChart data={categoryData} />
                                ) : (
                                    <CategoryBarChart data={categoryData} />
                                )}
                            </div>

                            {/* PAYMENT MODE SPLIT */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 shadow-inner">
                                        <CreditCard size={18} className="stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Payment Mode Split</h3>
                                </div>
                                {(!summary?.byPaymentMode || summary.byPaymentMode.length === 0) ? (
                                    <div className="border border-dashed border-white/10 rounded-2xl py-10 text-center bg-zinc-900/20">
                                        <p className="text-xs font-mono text-zinc-400">No data available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3.5">
                                        {summary.byPaymentMode.map((pm) => {
                                            const Icon = PAYMENT_MODE_ICON[pm._id] || CreditCard;
                                            const pct = Math.round((pm.total / summary.total) * 100);
                                            return (
                                                <div key={pm._id}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                                                            <Icon size={14} className="text-cyan-400" /> {pm._id}
                                                        </span>
                                                        <span className="text-xs font-mono font-bold text-white">{formatCurrency(pm.total)} <span className="text-zinc-500 font-normal">· {pct}%</span></span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-zinc-900 border border-white/5 overflow-hidden shadow-inner">
                                                        <div className="h-2 rounded-full bg-cyan-400 transition-all duration-700 shadow-inner" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* WEEKDAY PATTERN */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
                                        <CalendarDays size={18} className="stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Spending by Day of Week</h3>
                                </div>
                                <WeekdayChart data={weekdayData} />
                            </div>

                            {/* TOP VENDORS */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                                        <Users size={18} className="stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Top Vendors</h3>
                                </div>
                                {topVendors.length === 0 ? (
                                    <div className="border border-dashed border-white/10 rounded-2xl py-10 text-center bg-zinc-900/20">
                                        <p className="text-xs font-mono text-zinc-400">No vendor data available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {topVendors.map((v, i) => (
                                            <div key={v.vendor} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-white/5 bg-zinc-900/40 shadow-inner">
                                                <span className="text-xs font-mono font-bold text-zinc-500 w-4 shrink-0">{i + 1}</span>
                                                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
                                                    <Users size={13} className="stroke-[2.5]" />
                                                </div>
                                                <p className="text-xs sm:text-sm font-mono font-bold text-white truncate flex-1">{v.vendor}</p>
                                                <p className="text-xs sm:text-sm font-mono font-black text-cyan-400 shrink-0">{formatCurrency(v.total)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* TOP 5 EXPENSES */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                                        <Trophy size={18} className="stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Top 5 Expenses</h3>
                                </div>
                                <div className="space-y-2.5">
                                    {topExpenses.map((exp, i) => {
                                        const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
                                        const Icon = style.icon;
                                        const medal = i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-600";
                                        return (
                                            <div key={exp._id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-white/5 bg-zinc-900/40 shadow-inner">
                                                <span className={`text-xs font-mono font-black w-4 shrink-0 ${medal}`}>{i + 1}</span>
                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                                                    <Icon size={13} className="stroke-[2.5]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-mono font-bold text-white truncate">{exp.title}</p>
                                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{fmtDate(exp.date)} · {exp.category}</p>
                                                </div>
                                                <p className="text-xs sm:text-sm font-mono font-black text-cyan-400 shrink-0">{formatCurrency(exp.amount)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BUDGET VS ACTUAL */}
                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                                        <Target size={18} className="stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-mono font-bold text-white tracking-wide">Budget vs Actual</h3>
                                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()}</p>
                                    </div>
                                </div>
                                {budgets.length === 0 ? (
                                    <div className="border border-dashed border-white/10 rounded-2xl py-10 text-center bg-zinc-900/20">
                                        <AlertCircle size={22} className="mx-auto text-zinc-600 mb-2" />
                                        <p className="text-xs font-mono text-zinc-400">No budgets set this month</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {budgets.map((b) => {
                                            const barColor = b.status === "Over Budget" ? "bg-rose-500" : b.status === "Near Limit" ? "bg-amber-500" : "bg-emerald-500";
                                            return (
                                                <div key={b._id}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-mono text-zinc-300">{b.category}</span>
                                                        <span className="text-xs font-mono text-zinc-400">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-zinc-900 border border-white/5 overflow-hidden shadow-inner">
                                                        <div className={`h-2 rounded-full ${barColor} transition-all duration-700 shadow-inner`} style={{ width: `${Math.min(b.pct, 100)}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width:4px; height:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
            `}</style>
        </DashboardLayout>
    );
};

export default ExpenseAnalytics;