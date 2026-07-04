import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { EXPENSE_CATEGORIES, CATEGORY_STYLE, PAYMENT_MODE_ICON, formatCurrency, fmtDate, MONTH_NAMES } from "../../utils/expenseConstants.js";
import {
    RefreshCcw, Wallet, TrendingUp, Trophy, Receipt, BarChart3,
    PieChart as PieIcon, CreditCard, Target, AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-[68px] bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-gray-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-72 bg-gray-100 rounded-3xl" />
            <div className="h-72 bg-gray-100 rounded-3xl" />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY TREND BAR CHART (custom, no external lib)
// ─────────────────────────────────────────────────────────────────────────────

const TrendChart = ({ trend }) => {
    const max = Math.max(1, ...trend.map(t => t.total));
    return (
        <div className="flex items-end gap-2 sm:gap-3 h-52 pt-4">
            {trend.map((t, i) => {
                const heightPct = Math.max(2, Math.round((t.total / max) * 100));
                const isCurrent = i === trend.length - 1;
                return (
                    <div key={`${t.year}-${t.month}`} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                        <div className="relative w-full flex-1 flex items-end justify-center">
                            <div title={`${MONTH_NAMES[t.month - 1]} ${t.year}: ${formatCurrency(t.total)}`}
                                className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 cursor-default
                                    ${isCurrent ? "bg-blue-600" : "bg-indigo-300 group-hover:bg-indigo-400"}`}
                                style={{ height: `${heightPct}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 truncate w-full text-center">{MONTH_NAMES[t.month - 1].slice(0, 3)}</span>
                    </div>
                );
            })}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY DONUT CHART (custom SVG)
// ─────────────────────────────────────────────────────────────────────────────

const DONUT_COLORS = ["#2563eb", "#7c3aed", "#d97706", "#059669", "#dc2626", "#0891b2", "#db2777", "#65a30d", "#4f46e5", "#6b7280"];

const DonutChart = ({ data }) => {
    const total = data.reduce((s, d) => s + d.total, 0) || 1;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offsetAcc = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0 -rotate-90">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" />
                {data.map((d, i) => {
                    const frac = d.total / total;
                    const dash = frac * circumference;
                    const gap = circumference - dash;
                    const el = (
                        <circle key={d._id} cx="80" cy="80" r={radius} fill="none"
                            stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="20"
                            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offsetAcc}
                            strokeLinecap="butt" />
                    );
                    offsetAcc += dash;
                    return el;
                })}
                <circle cx="80" cy="80" r="42" fill="white" />
            </svg>
            <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {data.map((d, i) => (
                    <div key={d._id} className="flex items-center gap-2.5">
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
    const categoryData = categoryScope === "month" ? categoryMonth : categoryAll;
    const hasData = expenses.length > 0;

    const highestSingle = topExpenses[0] || null;
    const highestCategory = categoryAll[0] || null;

    return (
        <DashboardLayout activeMenu="Expenses Analytics">
            <div className="space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expense Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Spending trends, category breakdowns and budget performance</p>
                    </div>
                    <button type="button" onClick={() => fetchAll({ isRefresh: true })} disabled={loading || refreshing}
                        className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all self-start sm:self-auto">
                        <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
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
                        {/* STAT CARDS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">This Month</p>
                                    <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{formatCurrency(summary?.thisMonth)}</p>
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
                                    {RANGE_OPTIONS.map(opt => (
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
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                            <PieIcon size={16} className="text-purple-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900">Category Breakdown</h3>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
                                        {[{ key: "month", label: "This Month" }, { key: "all", label: "All Time" }].map(opt => (
                                            <button key={opt.key} type="button" onClick={() => setCategoryScope(opt.key)}
                                                className={`cursor-pointer px-3 h-8 rounded-xl text-xs font-semibold transition-all
                                                    ${categoryScope === opt.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {categoryData.length === 0 ? (
                                    <div className="border border-dashed border-gray-200 rounded-2xl py-10 text-center">
                                        <p className="text-sm text-gray-500">No spend in this period</p>
                                    </div>
                                ) : (
                                    <DonutChart data={categoryData} />
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
                                        {summary.byPaymentMode.map(pm => {
                                            const Icon = PAYMENT_MODE_ICON[pm._id] || CreditCard;
                                            const pct = Math.round((pm.total / summary.total) * 100);
                                            return (
                                                <div key={pm._id}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Icon size={14} className="text-gray-400" /> {pm._id}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(pm.total)}</span>
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
                                        return (
                                            <div key={exp._id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/60">
                                                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
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
                                        {budgets.map(b => {
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