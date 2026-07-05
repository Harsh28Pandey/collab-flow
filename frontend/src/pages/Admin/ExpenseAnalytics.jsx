import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODE_ICON, formatCurrency, fmtDate, MONTH_NAMES } from "../../utils/expenseConstants.js";
import {
    RefreshCcw, Wallet, TrendingUp, TrendingDown, Trophy, Receipt, BarChart3,
    PieChart as PieIcon, CreditCard, Target, AlertCircle, ArrowUpRight, ArrowDownRight,
    Download, Users, Lightbulb, Gauge, CalendarDays, ListFilter,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="space-y-5 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-[68px] bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-gray-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-72 bg-gray-100 rounded-3xl" />
            <div className="h-72 bg-gray-100 rounded-3xl" />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DONUT_COLORS = ["#2563eb", "#7c3aed", "#d97706", "#059669", "#dc2626", "#0891b2", "#db2777", "#65a30d", "#4f46e5", "#6b7280"];
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
        return <span className="text-[10px] font-semibold text-gray-400">No change</span>;
    }
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isGood ? "text-red-500" : "text-emerald-600"}`}>
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
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
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1="0" x2={w} y1={padY + (h - padY * 2) * f} y2={padY + (h - padY * 2) * f}
                        stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {areaPath && <path d={areaPath} fill="url(#trendFill)" />}
                {linePath && <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                {hovered && (
                    <line x1={hovered.x} x2={hovered.x} y1="0" y2={h} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                )}
                {points.map((p, i) => (
                    <circle key={`${p.year}-${p.month}`} cx={p.x} cy={p.y} r={hoverIndex === i ? 5.5 : 3}
                        fill={hoverIndex === i ? "#1d4ed8" : "#2563eb"} stroke="white" strokeWidth="2"
                        className="transition-all duration-150" />
                ))}
            </svg>

            <div className="flex justify-between mt-1 px-0.5">
                {trend.map((t, i) => (
                    <span key={`${t.year}-${t.month}`} className={`text-[10px] font-medium transition-colors ${hoverIndex === i ? "text-blue-600" : "text-gray-400"}`}>
                        {MONTH_NAMES[t.month - 1].slice(0, 3)}
                    </span>
                ))}
            </div>

            {hovered && (
                <div
                    className="absolute -top-1 pointer-events-none bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl z-10 whitespace-nowrap"
                    style={{ left: `${(hovered.x / w) * 100}%`, transform: "translate(-50%, -100%)" }}
                >
                    <p className="font-semibold">{MONTH_NAMES[hovered.month - 1]} {hovered.year}</p>
                    <p className="flex items-center gap-1.5">
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
                <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" />
                    {data.map((d, i) => {
                        const frac = d.total / total;
                        const dash = frac * circumference;
                        const gap = circumference - dash;
                        const el = (
                            <circle key={d._id} cx="80" cy="80" r={radius} fill="none"
                                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                                strokeWidth={hoverIdx === i ? 23 : 20}
                                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offsetAcc}
                                strokeLinecap="butt" className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHoverIdx(i)}
                                onMouseLeave={() => setHoverIdx(null)} />
                        );
                        offsetAcc += dash;
                        return el;
                    })}
                    <circle cx="80" cy="80" r="42" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                    <p className="text-[10px] text-gray-400 font-medium truncate max-w-full">
                        {hoverIdx !== null ? data[hoverIdx]._id : "Total"}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-full">
                        {formatCurrency(hoverIdx !== null ? data[hoverIdx].total : total)}
                    </p>
                </div>
            </div>
            <div className="flex-1 w-full space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {data.map((d, i) => (
                    <div key={d._id}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                        className={`flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 -mx-1.5 transition-colors cursor-default ${hoverIdx === i ? "bg-gray-50" : ""}`}>
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="text-sm text-gray-700 truncate flex-1">{d._id}</span>
                        <span className="text-xs text-gray-400 shrink-0">{Math.round((d.total / total) * 100)}%</span>
                        <span className="text-sm font-semibold text-gray-900 shrink-0 w-24 text-right">{formatCurrency(d.total)}</span>
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
                        <span className="flex items-center gap-2 text-sm text-gray-700 truncate">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            <span className="truncate">{d._id}</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 shrink-0 ml-2">
                            {formatCurrency(d.total)} <span className="text-gray-400 font-normal">· {Math.round((d.total / total) * 100)}%</span>
                        </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-2.5 rounded-full transition-all duration-700"
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
                                    className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 cursor-default
                                        ${isPeak ? "bg-indigo-600" : "bg-indigo-300 group-hover:bg-indigo-400"}`}
                                    style={{ height: `${pct}%` }} />
                            </div>
                            <span className={`text-[10px] font-medium ${isPeak ? "text-indigo-600 font-bold" : "text-gray-400"}`}>{d.label}</span>
                        </div>
                    );
                })}
            </div>
            {peak && peak.total > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                    You spend the most on <span className="font-semibold text-gray-600">{peak.label}days</span>
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
    const budgetStatusColor = budgetStatus === "Over Budget" ? "text-red-600 bg-red-50 border-red-200"
        : budgetStatus === "Near Limit" ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-emerald-600 bg-emerald-50 border-emerald-200";
    const budgetBarColor = budgetStatus === "Over Budget" ? "bg-red-500" : budgetStatus === "Near Limit" ? "bg-amber-500" : "bg-emerald-500";

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

    return (
        <DashboardLayout activeMenu="Expenses Analytics">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expense Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Spending trends, category breakdowns and budget performance</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={exportReport} disabled={loading || !hasData}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all">
                            <Download size={16} />
                            <span className="hidden sm:inline">Export Report</span>
                        </button>
                        <button type="button" onClick={() => fetchAll({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? <Skeleton /> : !hasData ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                        <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <BarChart3 size={28} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No data to analyze yet</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                            Once you start logging expenses, trends and breakdowns will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* INSIGHT BANNER */}
                        {insightText && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-4 sm:p-5 flex items-start gap-3 text-white shadow-sm shadow-blue-200">
                                <div className="h-9 w-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                                    <Lightbulb size={16} />
                                </div>
                                <p className="text-sm leading-relaxed pt-1.5">{insightText}</p>
                            </div>
                        )}

                        {/* STAT CARDS */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Wallet size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Total Spent</p>
                                    <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(summary?.total)}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><TrendingUp size={16} /></div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">This Month</p>
                                        <DeltaChip value={momChange} />
                                    </div>
                                    <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(summary?.thisMonth)}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0"><Gauge size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Avg / Day</p>
                                    <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(Math.round(avgPerDay))}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><PieIcon size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Top Category</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{highestCategory?._id || "—"}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Trophy size={16} /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Highest Expense</p>
                                    <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(highestSingle?.amount)}</p>
                                </div>
                            </div>
                        </div>

                        {/* BUDGET HEALTH */}
                        {totalBudget > 0 && (
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Gauge size={16} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Budget Health</h3>
                                            <p className="text-xs text-gray-400">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()} · {formatCurrency(totalBudgetSpent)} of {formatCurrency(totalBudget)} used</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border self-start sm:self-auto ${budgetStatusColor}`}>
                                        {budgetStatus}
                                    </span>
                                </div>
                                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                    <div className={`h-3 rounded-full ${budgetBarColor} transition-all duration-700`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">{budgetPct}% used</span>
                                    <span className="text-xs text-gray-400">{formatCurrency(Math.max(totalBudget - totalBudgetSpent, 0))} remaining</span>
                                </div>
                            </div>
                        )}

                        {/* MONTHLY TREND */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                        <BarChart3 size={16} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">Monthly Spending Trend</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
                                    {RANGE_OPTIONS.map((opt) => (
                                        <button key={opt.label} type="button" onClick={() => setTrendMonths(opt.months)}
                                            className={`cursor-pointer px-3 h-8 rounded-xl text-xs font-semibold transition-all
                                                ${trendMonths === opt.months ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <TrendChart trend={trend} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* CATEGORY BREAKDOWN */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                            <PieIcon size={16} className="text-purple-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900">Category Breakdown</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
                                            {[{ key: "month", label: "This Month" }, { key: "all", label: "All Time" }].map((opt) => (
                                                <button key={opt.key} type="button" onClick={() => setCategoryScope(opt.key)}
                                                    className={`cursor-pointer px-3 h-8 rounded-xl text-xs font-semibold transition-all
                                                        ${categoryScope === opt.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => setCategoryView((v) => (v === "donut" ? "bar" : "donut"))}
                                            title="Toggle chart view"
                                            className="cursor-pointer h-8 w-8 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition">
                                            {categoryView === "donut" ? <BarChart3 size={14} className="text-gray-500" /> : <PieIcon size={14} className="text-gray-500" />}
                                        </button>
                                    </div>
                                </div>
                                {categoryData.length === 0 ? (
                                    <div className="border border-dashed border-gray-200 rounded-2xl py-10 text-center">
                                        <p className="text-sm text-gray-500">No spend in this period</p>
                                    </div>
                                ) : categoryView === "donut" ? (
                                    <DonutChart data={categoryData} />
                                ) : (
                                    <CategoryBarChart data={categoryData} />
                                )}
                            </div>

                            {/* PAYMENT MODE SPLIT */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="h-9 w-9 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                                        <CreditCard size={16} className="text-teal-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">Payment Mode Split</h3>
                                </div>
                                {(!summary?.byPaymentMode || summary.byPaymentMode.length === 0) ? (
                                    <div className="border border-dashed border-gray-200 rounded-2xl py-10 text-center">
                                        <p className="text-sm text-gray-500">No data available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3.5">
                                        {summary.byPaymentMode.map((pm) => {
                                            const Icon = PAYMENT_MODE_ICON[pm._id] || CreditCard;
                                            const pct = Math.round((pm.total / summary.total) * 100);
                                            return (
                                                <div key={pm._id}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Icon size={14} className="text-gray-400" /> {pm._id}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(pm.total)} <span className="text-gray-400 font-normal">· {pct}%</span></span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div className="h-2 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* WEEKDAY PATTERN */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="h-9 w-9 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                                        <CalendarDays size={16} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">Spending by Day of Week</h3>
                                </div>
                                <WeekdayChart data={weekdayData} />
                            </div>

                            {/* TOP VENDORS */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="h-9 w-9 rounded-2xl bg-cyan-100 flex items-center justify-center shrink-0">
                                        <Users size={16} className="text-cyan-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">Top Vendors</h3>
                                </div>
                                {topVendors.length === 0 ? (
                                    <div className="border border-dashed border-gray-200 rounded-2xl py-10 text-center">
                                        <p className="text-sm text-gray-500">No vendor data available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {topVendors.map((v, i) => (
                                            <div key={v.vendor} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/60">
                                                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                                                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-cyan-50 text-cyan-600 border border-cyan-100">
                                                    <Users size={13} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 truncate flex-1">{v.vendor}</p>
                                                <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(v.total)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* TOP 5 EXPENSES */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="h-9 w-9 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <Trophy size={16} className="text-amber-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">Top 5 Expenses</h3>
                                </div>
                                <div className="space-y-2">
                                    {topExpenses.map((exp, i) => {
                                        const style = CATEGORY_STYLE[exp.category] || CATEGORY_STYLE.Miscellaneous;
                                        const Icon = style.icon;
                                        const medal = i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-400" : "text-gray-300";
                                        return (
                                            <div key={exp._id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/60">
                                                <span className={`text-xs font-bold w-4 shrink-0 ${medal}`}>{i + 1}</span>
                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                                                    <Icon size={13} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
                                                    <p className="text-xs text-gray-400">{fmtDate(exp.date)} · {exp.category}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(exp.amount)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BUDGET VS ACTUAL */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="h-9 w-9 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                                        <Target size={16} className="text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Budget vs Actual</h3>
                                        <p className="text-xs text-gray-400">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()}</p>
                                    </div>
                                </div>
                                {budgets.length === 0 ? (
                                    <div className="border border-dashed border-gray-200 rounded-2xl py-10 text-center">
                                        <AlertCircle size={22} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No budgets set this month</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {budgets.map((b) => {
                                            const barColor = b.status === "Over Budget" ? "bg-red-500" : b.status === "Near Limit" ? "bg-amber-500" : "bg-green-500";
                                            return (
                                                <div key={b._id}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-sm text-gray-700">{b.category}</span>
                                                        <span className="text-xs text-gray-500">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div className={`h-2 rounded-full ${barColor} transition-all duration-700`} style={{ width: `${Math.min(b.pct, 100)}%` }} />
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
                .custom-scrollbar::-webkit-scrollbar { width:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
            `}</style>
        </DashboardLayout>
    );
};

export default ExpenseAnalytics;