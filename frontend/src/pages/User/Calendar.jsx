import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    ChevronLeft, ChevronRight, RefreshCcw, CalendarDays,
    ClipboardCheck, Clock3, X, AlertCircle, CheckCircle2,
    Search, CalendarRange, LayoutGrid, List,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const PRIORITY = {
    High: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", pill: "bg-red-500" },
    Medium: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", pill: "bg-amber-500" },
    Low: { dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200", pill: "bg-green-500" },
};

const STATUS_BADGE = {
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    "Completed": "bg-green-50 text-green-700 border-green-200",
};

const fmt = (d, opts) => new Date(d).toLocaleDateString("en-IN", opts);
const dateKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; };
const isSameDay = (a, b) => { const da = new Date(a), db = new Date(b); return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate(); };
const isPast = (d) => new Date(d) < new Date(new Date().setHours(0, 0, 0, 0));
const startOfWeek = (d) => { const dt = new Date(d); dt.setDate(dt.getDate() - dt.getDay()); dt.setHours(0, 0, 0, 0); return dt; };

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
            <div className="h-7 w-40 bg-gray-200 rounded-xl" />
            <div className="flex gap-2">
                <div className="h-9 w-9 bg-gray-200 rounded-xl" />
                <div className="h-9 w-20 bg-gray-200 rounded-xl" />
                <div className="h-9 w-9 bg-gray-200 rounded-xl" />
            </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => <div key={d} className="h-7 bg-gray-100 rounded-lg" />)}
        </div>
        {[...Array(5)].map((_, r) => (
            <div key={r} className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, c) => <div key={c} className="h-20 sm:h-24 bg-gray-100 rounded-2xl" />)}
            </div>
        ))}
    </div>
);

const SidebarSkeleton = () => (
    <div className="animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="h-8 w-8 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DAY DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────

const DayModal = ({ date, events, onClose }) => {
    if (!date) return null;
    const tasks = events.filter(e => e.type === "task");
    const tss = events.filter(e => e.type === "timesheet");
    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-[26px] shadow-2xl max-h-[85vh] flex flex-col animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                            <CalendarDays size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                {fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5 space-y-5 custom-scrollbar">

                    {tasks.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ClipboardCheck size={15} className="text-blue-600" />
                                <h3 className="text-sm font-semibold text-gray-800">Tasks Due ({tasks.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {tasks.map(t => {
                                    const pc = PRIORITY[t.priority] || PRIORITY.Low;
                                    const sc = STATUS_BADGE[t.status] || STATUS_BADGE["Pending"];
                                    return (
                                        <div key={t.id} className={`rounded-2xl p-3.5 border ${t.overdue ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-100"}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-900 leading-snug">{t.title}</p>
                                                <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${sc}`}>{t.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${pc.badge}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                                                    {t.priority} Priority
                                                </span>
                                                {t.overdue && <span className="text-[11px] font-semibold text-red-600">⚠ Overdue</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tss.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock3 size={15} className="text-green-600" />
                                <h3 className="text-sm font-semibold text-gray-800">Timesheets ({tss.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {tss.map(ts => (
                                    <div key={ts.id} className="bg-green-50 border border-green-100 rounded-2xl p-3.5">
                                        <p className="text-sm font-medium text-gray-900">{ts.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{ts.hours} hrs · {ts.workMode}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {events.length === 0 && (
                        <div className="text-center py-10">
                            <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">No events on this day</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// WEEK VIEW
// ─────────────────────────────────────────────────────────────────────────────

const WeekView = ({ weekStart, eventMap, today, onDayClick }) => {
    const days = [...Array(7)].map((_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
    return (
        <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
                const key = dateKey(d);
                const events = eventMap[key] || [];
                const tasks = events.filter(e => e.type === "task");
                const tss = events.filter(e => e.type === "timesheet");
                const isToday = isSameDay(d, today);
                return (
                    <button key={i} type="button" onClick={() => onDayClick(d, events)}
                        className={`cursor-pointer rounded-2xl p-2 min-h-[120px] text-left flex flex-col transition-all
                            ${isToday ? "bg-blue-600" : events.length > 0 ? "bg-blue-50 border border-blue-200 hover:bg-blue-100" : "bg-gray-50 border border-transparent hover:bg-gray-100"}`}>
                        <div className="mb-2">
                            <span className={`text-[10px] font-semibold uppercase ${isToday ? "text-white/70" : "text-gray-400"}`}>{DAYS[d.getDay()]}</span>
                            <p className={`text-lg font-bold leading-tight ${isToday ? "text-white" : "text-gray-800"}`}>{d.getDate()}</p>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            {tasks.slice(0, 2).map(e => (
                                <span key={e.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg truncate ${isToday ? "bg-white/20 text-white" : e.overdue ? "bg-red-500 text-white" : "bg-blue-600 text-white"}`}>{e.title}</span>
                            ))}
                            {tss.slice(0, 1).map(e => (
                                <span key={e.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg truncate ${isToday ? "bg-white/20 text-white" : "bg-green-600 text-white"}`}>{e.title}</span>
                            ))}
                            {events.length > 3 && <span className={`text-[10px] ${isToday ? "text-white/70" : "text-gray-400"}`}>+{events.length - 3} more</span>}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HEATMAP VIEW
// ─────────────────────────────────────────────────────────────────────────────

const HeatmapView = ({ year, eventMap }) => {
    const weeks = useMemo(() => {
        const jan1 = new Date(year, 0, 1);
        const offset = jan1.getDay();
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        const total = isLeap ? 366 : 365;
        const cells = [...Array(offset)].map(() => null);
        for (let d = 0; d < total; d++) {
            const dt = new Date(year, 0, 1 + d);
            cells.push({ dt, count: (eventMap[dateKey(dt)] || []).length });
        }
        const rows = [];
        for (let w = 0; w < Math.ceil(cells.length / 7); w++) rows.push(cells.slice(w * 7, w * 7 + 7));
        return rows;
    }, [year, eventMap]);

    const maxCount = useMemo(() => Math.max(1, ...Object.values(eventMap).map(e => e.length)), [eventMap]);
    const shade = (n) => { if (!n) return "bg-gray-100"; const r = n / maxCount; if (r < 0.25) return "bg-blue-200"; if (r < 0.5) return "bg-blue-400"; if (r < 0.75) return "bg-blue-500"; return "bg-blue-700"; };

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Each square = 1 day. Darker = more events.</p>
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max">
                    {weeks.map((wk, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                            {[...Array(7)].map((_, di) => {
                                const c = wk[di];
                                if (!c) return <div key={di} className="h-3 w-3" />;
                                return (
                                    <div key={di} title={`${fmt(c.dt, { month: "short", day: "numeric" })} — ${c.count} event${c.count !== 1 ? "s" : ""}`}
                                        className={`h-3 w-3 rounded-sm ${shade(c.count)} transition-all hover:ring-2 hover:ring-blue-400`} />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Less</span>
                {["bg-gray-100", "bg-blue-200", "bg-blue-400", "bg-blue-500", "bg-blue-700"].map((c, i) => (
                    <span key={i} className={`h-3 w-3 rounded-sm ${c}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR PANEL — shared by Today's Agenda & Upcoming Events
// ─────────────────────────────────────────────────────────────────────────────

const EventItem = ({ event }) => {
    const isTask = event.type === "task";
    return (
        <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-2xl border
            ${isTask ? event.overdue ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                : "bg-green-50 border-green-100"}`}>
            <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                ${isTask ? event.overdue ? "bg-red-100" : "bg-blue-100" : "bg-green-100"}`}>
                {isTask
                    ? <ClipboardCheck size={13} className={event.overdue ? "text-red-600" : "text-blue-600"} />
                    : <Clock3 size={13} className="text-green-600" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {isTask
                        ? `${event.priority} · ${event.status}${event.overdue ? " · ⚠ Overdue" : ""}`
                        : `${event.hours}h logged · ${event.workMode}`}
                </p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALENDAR PAGE
// ─────────────────────────────────────────────────────────────────────────────

const Calendar = () => {
    const today = new Date();

    // Calendar state
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [view, setView] = useState("month"); // "month" | "week" | "heatmap"
    const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

    // Data
    const [tasks, setTasks] = useState([]);
    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [showTasks, setShowTasks] = useState(true);
    const [showTimesheets, setShowTimesheets] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const [tRes, tsRes] = await Promise.allSettled([
                axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS),
                axiosInstance.get(API_PATHS.TIMESHEET.GET_MY_TIMESHEETS),
            ]);
            if (tRes.status === "fulfilled") {
                const raw = tRes.value.data?.tasks || tRes.value.data || [];
                setTasks(Array.isArray(raw) ? raw : []);
            }
            if (tsRes.status === "fulfilled") {
                const raw = tsRes.value.data?.data || tsRes.value.data || [];
                setTimesheets(Array.isArray(raw) ? raw : []);
            }
        } catch (e) { console.log(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── EVENT MAP ──────────────────────────────────────────────────────────
    const eventMap = useMemo(() => {
        const map = {};
        const add = (key, ev) => { if (!map[key]) map[key] = []; map[key].push(ev); };
        const q = searchQuery.trim().toLowerCase();

        if (showTasks) {
            tasks.forEach(t => {
                if (!t.dueDate) return;
                if (priorityFilter !== "All" && t.priority !== priorityFilter) return;
                if (q && !(t.title || "").toLowerCase().includes(q)) return;
                const d = new Date(t.dueDate);
                add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, {
                    id: t._id, type: "task",
                    title: t.title || "Untitled Task",
                    priority: t.priority || "Low",
                    status: t.status || "Pending",
                    overdue: isPast(t.dueDate) && t.status !== "Completed",
                    date: d,
                });
            });
        }

        if (showTimesheets) {
            timesheets.forEach(ts => {
                if (!ts.date) return;
                if (q && !(ts.project || "").toLowerCase().includes(q)) return;
                const d = new Date(ts.date);
                add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, {
                    id: ts._id, type: "timesheet",
                    title: ts.project || "Timesheet",
                    hours: ts.totalHours ?? 0,
                    workMode: ts.workMode || "",
                    date: d,
                });
            });
        }
        return map;
    }, [tasks, timesheets, showTasks, showTimesheets, priorityFilter, searchQuery]);

    // ── CALENDAR GRID ──────────────────────────────────────────────────────
    const calendarDays = useMemo(() => {
        const first = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const prev = new Date(year, month, 0).getDate();
        const cells = [];
        for (let i = first - 1; i >= 0; i--)  cells.push({ day: prev - i, current: false, date: null });
        for (let d = 1; d <= days; d++)      cells.push({ day: d, current: true, date: new Date(year, month, d) });
        for (let d = 1; d <= 42 - cells.length; d++) cells.push({ day: d, current: false, date: null });
        return cells;
    }, [year, month]);

    // ── NAVIGATION ─────────────────────────────────────────────────────────
    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
    const goToday = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); setWeekStart(startOfWeek(today)); };
    const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n; });
    const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n; });

    const openDay = (date, evs) => { setSelectedDate(date); setSelectedEvents(evs || []); };
    const openCell = (cell) => {
        if (!cell.current || !cell.date) return;
        openDay(cell.date, eventMap[`${year}-${month}-${cell.day}`] || []);
    };

    // ── DERIVED STATS ──────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.status === "Completed").length,
        overdue: tasks.filter(t => t.dueDate && isPast(t.dueDate) && t.status !== "Completed").length,
        tsCount: timesheets.length,
        tsHours: timesheets.reduce((s, t) => s + (t.totalHours || 0), 0),
    }), [tasks, timesheets]);

    const monthStats = useMemo(() => {
        const inMonth = (d) => { const dt = new Date(d); return dt.getFullYear() === year && dt.getMonth() === month; };
        const due = tasks.filter(t => t.dueDate && inMonth(t.dueDate));
        const done = due.filter(t => t.status === "Completed");
        const hrs = timesheets.filter(t => t.date && inMonth(t.date)).reduce((s, t) => s + (t.totalHours || 0), 0);
        return { due: due.length, done: done.length, hrs, pct: due.length > 0 ? Math.round(done.length / due.length * 100) : 0 };
    }, [tasks, timesheets, year, month]);

    // ── TODAY & UPCOMING ───────────────────────────────────────────────────
    const todayEvents = eventMap[dateKey(today)] || [];

    const upcomingDays = useMemo(() => {
        const result = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today); d.setDate(today.getDate() + i);
            const evs = eventMap[dateKey(d)] || [];
            if (evs.length > 0) result.push({ date: d, events: evs });
        }
        return result;
    }, [eventMap]);

    const hasData = stats.total > 0 || stats.tsCount > 0;
    const weekLabel = `${fmt(weekStart, { month: "short", day: "numeric" })} – ${fmt(new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)), { month: "short", day: "numeric", year: "numeric" })}`;

    // ── RENDER ─────────────────────────────────────────────────────────────
    return (
        <DashboardLayout activeMenu="Calendar">
            <div className="space-y-5">

                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Calendar</h1>
                        <p className="text-sm text-gray-500 mt-1">Tasks, timesheets and your schedule at a glance</p>
                    </div>
                    <button type="button" onClick={() => fetchData({ isRefresh: true })} disabled={loading || refreshing}
                        className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all self-start sm:self-auto">
                        <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* STAT PILLS */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                            { label: "Total Tasks", value: stats.total, icon: <ClipboardCheck size={16} />, bg: "bg-blue-100", text: "text-blue-600" },
                            { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={16} />, bg: "bg-green-100", text: "text-green-600" },
                            { label: "Overdue", value: stats.overdue, icon: <AlertCircle size={16} />, bg: "bg-red-100", text: "text-red-600" },
                            { label: "Timesheets", value: stats.tsCount, icon: <Clock3 size={16} />, bg: "bg-purple-100", text: "text-purple-600" },
                            { label: "Hours Logged", value: `${stats.tsHours}h`, icon: <Clock3 size={16} />, bg: "bg-amber-100", text: "text-amber-600" },
                        ].map(({ label, value, icon, bg, text }) => (
                            <div key={label} className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-xl ${bg} ${text} flex items-center justify-center shrink-0`}>{icon}</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">{label}</p>
                                    <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MONTH SUMMARY BANNER */}
                {!loading && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-sm text-white/70 font-medium">{MONTHS[month]} {year}</p>
                                <h2 className="text-xl font-bold mt-0.5">Month Summary</h2>
                            </div>
                            <div className="flex flex-wrap gap-5">
                                {[
                                    { label: "Tasks Due", val: monthStats.due },
                                    { label: "Completed", val: monthStats.done },
                                    { label: "Hours Logged", val: `${monthStats.hrs}h` },
                                    { label: "Completion", val: `${monthStats.pct}%` },
                                ].map(({ label, val }) => (
                                    <div key={label} className="text-center">
                                        <p className="text-2xl font-extrabold">{val}</p>
                                        <p className="text-xs text-white/70">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {monthStats.due > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-white/70 mb-1.5">
                                    <span>Progress</span>
                                    <span>{monthStats.done}/{monthStats.due} tasks</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/20">
                                    <div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${monthStats.pct}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SEARCH + FILTERS */}
                {!loading && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search tasks or projects..."
                                className="w-full h-10 pl-10 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>

                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setShowTasks(v => !v)}
                                className={`cursor-pointer h-10 px-4 rounded-2xl text-sm font-medium transition-all flex items-center gap-1.5 border
                                    ${showTasks ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-blue-50"}`}>
                                <ClipboardCheck size={14} /> Tasks
                            </button>
                            <button type="button" onClick={() => setShowTimesheets(v => !v)}
                                className={`cursor-pointer h-10 px-4 rounded-2xl text-sm font-medium transition-all flex items-center gap-1.5 border
                                    ${showTimesheets ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:bg-green-50"}`}>
                                <Clock3 size={14} /> Timesheets
                            </button>
                        </div>

                        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                            className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer">
                            {["All", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                        </select>

                        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 self-start sm:self-auto">
                            {[
                                { key: "month", icon: <LayoutGrid size={14} />, label: "Month" },
                                { key: "week", icon: <CalendarRange size={14} />, label: "Week" },
                                { key: "heatmap", icon: <List size={14} />, label: "Heat" },
                            ].map(({ key, icon, label }) => (
                                <button key={key} type="button" onClick={() => setView(key)}
                                    className={`cursor-pointer flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold transition-all
                                        ${view === key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                    {icon}{label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CALENDAR + SIDEBAR ────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-5 items-start">

                    {/* MAIN CALENDAR */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 min-w-0">
                        {loading ? <Skeleton /> : (
                            <>
                                {/* Nav */}
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                                        {view === "week" ? weekLabel : view === "heatmap" ? `${year} Activity` : `${MONTHS[month]} ${year}`}
                                    </h2>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button type="button" onClick={view === "week" ? prevWeek : prevMonth}
                                            className="cursor-pointer h-9 w-9 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center">
                                            <ChevronLeft size={17} className="text-gray-600" />
                                        </button>
                                        <button type="button" onClick={goToday}
                                            className="cursor-pointer h-9 px-4 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition text-sm font-medium text-gray-700">
                                            Today
                                        </button>
                                        <button type="button" onClick={view === "week" ? nextWeek : nextMonth}
                                            className="cursor-pointer h-9 w-9 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center">
                                            <ChevronRight size={17} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* MONTH VIEW */}
                                {view === "month" && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {calendarDays.map((cell, idx) => {
                                                const key = cell.current ? `${year}-${month}-${cell.day}` : null;
                                                const events = (key && eventMap[key]) || [];
                                                const taskEvs = events.filter(e => e.type === "task");
                                                const tsEvs = events.filter(e => e.type === "timesheet");
                                                const overdue = taskEvs.some(e => e.overdue);
                                                const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                                const hl = searchQuery && events.length > 0;
                                                return (
                                                    <button key={idx} type="button" disabled={!cell.current} onClick={() => openCell(cell)}
                                                        className={`cursor-pointer rounded-2xl p-1.5 sm:p-2 min-h-[64px] sm:min-h-[90px] text-left flex flex-col transition-all duration-150
                                                            ${!cell.current ? "opacity-0 pointer-events-none"
                                                                : isToday ? "bg-blue-600 hover:bg-blue-700"
                                                                    : overdue ? "bg-red-50 border border-red-200 hover:bg-red-100"
                                                                        : hl ? "ring-2 ring-amber-400 bg-amber-50 hover:bg-amber-100"
                                                                            : events.length > 0 ? "bg-blue-50 border border-blue-200 hover:bg-blue-100"
                                                                                : "bg-gray-50 border border-transparent hover:bg-gray-100 hover:border-gray-200"}`}>
                                                        <span className={`text-xs sm:text-sm font-semibold leading-none mb-1.5
                                                            ${isToday ? "text-white" : overdue ? "text-red-700" : "text-gray-700"}`}>
                                                            {cell.day}
                                                        </span>
                                                        <div className="hidden sm:flex flex-col gap-1 w-full">
                                                            {taskEvs.slice(0, 2).map(e => (
                                                                <span key={e.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg truncate
                                                                    ${isToday ? "bg-white/20 text-white" : e.overdue ? "bg-red-500 text-white" : "bg-blue-600 text-white"}`}>{e.title}</span>
                                                            ))}
                                                            {tsEvs.slice(0, 1).map(e => (
                                                                <span key={e.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg truncate
                                                                    ${isToday ? "bg-white/20 text-white" : "bg-green-600 text-white"}`}>{e.title}</span>
                                                            ))}
                                                            {events.length > 3 && <span className={`text-[10px] ${isToday ? "text-white/70" : "text-gray-400"}`}>+{events.length - 3} more</span>}
                                                        </div>
                                                        {events.length > 0 && (
                                                            <div className="flex sm:hidden gap-0.5 mt-auto flex-wrap">
                                                                {taskEvs.length > 0 && <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : overdue ? "bg-red-500" : "bg-blue-500"}`} />}
                                                                {tsEvs.length > 0 && <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white/70" : "bg-green-500"}`} />}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {/* WEEK VIEW */}
                                {view === "week" && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">{d}</div>)}
                                        </div>
                                        <WeekView weekStart={weekStart} eventMap={eventMap} today={today} onDayClick={openDay} />
                                    </>
                                )}

                                {/* HEATMAP VIEW */}
                                {view === "heatmap" && <HeatmapView year={year} eventMap={eventMap} />}

                                {/* Legend */}
                                {view !== "heatmap" && (
                                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                                        {[
                                            { color: "bg-blue-600", label: "Task due" },
                                            { color: "bg-green-600", label: "Timesheet" },
                                            { color: "bg-red-500", label: "Overdue" },
                                            { color: "bg-blue-600 ring-2 ring-blue-400 ring-offset-1", label: "Today" },
                                        ].map(({ color, label }) => (
                                            <div key={label} className="flex items-center gap-1.5">
                                                <span className={`h-3 w-3 rounded-sm shrink-0 ${color}`} />
                                                <span className="text-xs text-gray-500">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SIDEBAR — Today's Agenda + Upcoming */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-5 shrink-0">

                        {/* TODAY'S AGENDA */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="h-9 w-9 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <CalendarDays size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Today's Agenda</h3>
                                    <p className="text-xs text-gray-400">{fmt(today, { weekday: "long", day: "numeric", month: "short" })}</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : todayEvents.length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-2xl py-8 text-center">
                                    <CalendarDays size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Nothing today</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Enjoy your clear day!</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {todayEvents.map(e => <EventItem key={e.id} event={e} />)}
                                </div>
                            )}
                        </div>

                        {/* UPCOMING — next 7 days */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="h-9 w-9 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                                    <CalendarRange size={16} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Upcoming (7 Days)</h3>
                                    <p className="text-xs text-gray-400">{upcomingDays.reduce((s, d) => s + d.events.length, 0)} events ahead</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : upcomingDays.length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-2xl py-8 text-center">
                                    <CheckCircle2 size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm font-medium text-gray-600">All clear ahead!</p>
                                    <p className="text-xs text-gray-400 mt-0.5">No events in the next 7 days</p>
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                    {upcomingDays.map(({ date, events }) => (
                                        <div key={dateKey(date)}>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                                {isSameDay(date, today) ? "Today" : fmt(date, { weekday: "short", day: "numeric", month: "short" })}
                                            </p>
                                            <div className="space-y-1.5">
                                                {events.slice(0, 3).map(e => (
                                                    <div key={e.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border
                                                        ${e.type === "task" ? e.overdue ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0
                                                            ${e.type === "task" ? e.overdue ? "bg-red-500" : "bg-blue-500" : "bg-green-500"}`} />
                                                        <span className="text-xs font-medium text-gray-800 truncate flex-1">{e.title}</span>
                                                        {e.overdue && <span className="text-[10px] text-red-600 font-bold shrink-0">OD</span>}
                                                    </div>
                                                ))}
                                                {events.length > 3 && <p className="text-[10px] text-gray-400 pl-1">+{events.length - 3} more</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {!loading && !hasData && (
                    <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                        <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <CalendarDays size={28} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Your calendar is clear</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                            No tasks or timesheets yet. Once your team assigns tasks or approves timesheets, they'll show up here.
                        </p>
                    </div>
                )}
            </div>

            {/* DAY MODAL */}
            {selectedDate && (
                <DayModal
                    date={selectedDate}
                    events={selectedEvents}
                    onClose={() => { setSelectedDate(null); setSelectedEvents([]); }}
                />
            )}

            <style>{`
                @keyframes modalPop {
                    from { opacity:0; transform:scale(.96); }
                    to   { opacity:1; transform:scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { width:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
            `}</style>
        </DashboardLayout>
    );
};

export default Calendar;