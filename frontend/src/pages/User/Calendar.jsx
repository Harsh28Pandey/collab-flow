import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    ChevronLeft, ChevronRight, RefreshCcw, CalendarDays,
    ClipboardCheck, Clock3, X, AlertCircle, CheckCircle2,
    Search, CalendarRange, LayoutGrid, List, Megaphone, Users, Sparkles,
} from "lucide-react";

// Import exact TaskStatusTabs component as requested
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const PRIORITY = {
    High: { dot: "bg-rose-500", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", pill: "bg-rose-500" },
    Medium: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", pill: "bg-amber-500" },
    Low: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", pill: "bg-emerald-500" },
};

const STATUS_BADGE = {
    "Pending": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "In Progress": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Completed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

// admin-created event "type" -> color + icon
const EVENT_TYPE_STYLE = {
    Meeting: { solid: "bg-blue-500", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Users },
    Holiday: { solid: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CalendarDays },
    Announcement: { solid: "bg-purple-500", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Megaphone },
    Deadline: { solid: "bg-rose-500", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: AlertCircle },
    Event: { solid: "bg-indigo-500", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Sparkles },
};

const fmt = (d, opts) => new Date(d).toLocaleDateString("en-IN", opts);
const dateKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; };
const isSameDay = (a, b) => { const da = new Date(a), db = new Date(b); return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate(); };
const isPast = (d) => new Date(d) < new Date(new Date().setHours(0, 0, 0, 0));
const startOfWeek = (d) => { const dt = new Date(d); dt.setDate(dt.getDate() - dt.getDay()); dt.setHours(0, 0, 0, 0); return dt; };
const to12h = (t) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); const period = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2, "0")} ${period}`; };

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const Skeleton = () => (
    <div className="animate-pulse space-y-5">
        <div className="flex items-center justify-between">
            <SkeletonBlock className="h-8 w-48 rounded-xl" />
            <div className="flex gap-2.5">
                <SkeletonBlock className="h-10 w-10 rounded-xl" />
                <SkeletonBlock className="h-10 w-24 rounded-xl" />
                <SkeletonBlock className="h-10 w-10 rounded-xl" />
            </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map(d => <SkeletonBlock key={d} className="h-8 rounded-lg" />)}
        </div>
        {[...Array(5)].map((_, r) => (
            <div key={r} className="grid grid-cols-7 gap-1.5">
                {[...Array(7)].map((_, c) => <SkeletonBlock key={c} className="h-24 sm:h-28 rounded-2xl" />)}
            </div>
        ))}
    </div>
);

const SidebarSkeleton = () => (
    <div className="animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-2xl">
                <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-3 w-3/4 rounded-full" />
                    <SkeletonBlock className="h-2.5 w-1/2 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TOGGLE HELPER (Mimicking exactly TaskStatusTabs for Multi-selects)
// ─────────────────────────────────────────────────────────────────────────────

const FilterToggle = ({ label, active, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
            active
                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5'
        }`}
    >
        <div className='flex items-center gap-2'>
            <span>{label}</span>
            <span
                className={`text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 flex items-center justify-center rounded-full ${
                    active
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/5'
                }`}
            >
                {icon}
            </span>
        </div>
        {active && (
            <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
        )}
    </button>
);


// ─────────────────────────────────────────────────────────────────────────────
// DAY DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────

const DayModal = ({ date, events, onClose }) => {
    if (!date) return null;
    const tasks = events.filter(e => e.type === "task");
    const tss = events.filter(e => e.type === "timesheet");
    const evs = events.filter(e => e.type === "event");
    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[85vh] flex flex-col animate-[modalPop_.2s_ease] relative overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Top Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            <CalendarDays size={20} className="text-cyan-400 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-base font-mono font-black text-white tracking-wide">
                                {fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </h2>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition shadow-inner">
                        <X size={16} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar">

                    {evs.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <Megaphone size={16} className="text-indigo-400 stroke-[2.5]" />
                                <h3 className="text-xs sm:text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">Events & Announcements ({evs.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {evs.map(e => {
                                    const style = EVENT_TYPE_STYLE[e.eventType] || EVENT_TYPE_STYLE.Event;
                                    const Icon = style.icon;
                                    return (
                                        <div key={e.id} className="rounded-2xl p-4 border border-white/5 bg-zinc-900/50 shadow-inner">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                                                        <Icon size={16} className="stroke-[2.5]" />
                                                    </div>
                                                    <div className="min-w-0 mt-0.5">
                                                        <p className="text-sm font-mono font-bold text-white leading-snug break-words">{e.title}</p>
                                                        <p className="text-[11px] font-mono text-zinc-500 mt-1">{to12h(e.time)}</p>
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner uppercase tracking-wider ${style.badge}`}>{e.eventType}</span>
                                            </div>
                                            {e.description && <p className="text-xs font-mono text-zinc-400 mt-3 leading-relaxed border-t border-white/5 pt-3">{e.description}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tasks.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <ClipboardCheck size={16} className="text-cyan-400 stroke-[2.5]" />
                                <h3 className="text-xs sm:text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">Tasks Due ({tasks.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {tasks.map(t => {
                                    const pc = PRIORITY[t.priority] || PRIORITY.Low;
                                    const sc = STATUS_BADGE[t.status] || STATUS_BADGE["Pending"];
                                    return (
                                        <div key={t.id} className={`rounded-2xl p-4 border shadow-inner ${t.overdue ? "bg-rose-500/5 border-rose-500/20" : "bg-cyan-500/5 border-cyan-500/20"}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-mono font-bold text-white leading-snug">{t.title}</p>
                                                <span className={`shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner uppercase tracking-wider ${sc}`}>{t.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 mt-3">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border shadow-inner uppercase tracking-wider ${pc.badge}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full shadow-inner ${pc.dot}`} />
                                                    {t.priority}
                                                </span>
                                                {t.overdue && <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg uppercase tracking-wider">⚠ Overdue</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tss.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <Clock3 size={16} className="text-emerald-400 stroke-[2.5]" />
                                <h3 className="text-xs sm:text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">Timesheets ({tss.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {tss.map(ts => (
                                    <div key={ts.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 shadow-inner">
                                        <p className="text-sm font-mono font-bold text-white">{ts.title}</p>
                                        <p className="text-[11px] font-mono text-zinc-500 mt-1.5"><span className="text-emerald-400 font-bold">{ts.hours} hrs</span> · {ts.workMode}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {events.length === 0 && (
                        <div className="text-center py-12">
                            <CalendarDays size={36} className="mx-auto text-zinc-600 mb-4" />
                            <p className="text-sm font-mono font-bold text-zinc-400">No events on this day</p>
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
        <div className="grid grid-cols-7 gap-1.5">
            {days.map((d, i) => {
                const key = dateKey(d);
                const events = eventMap[key] || [];
                const tasks = events.filter(e => e.type === "task");
                const tss = events.filter(e => e.type === "timesheet");
                const evs = events.filter(e => e.type === "event");
                const isToday = isSameDay(d, today);
                return (
                    <button key={i} type="button" onClick={() => onDayClick(d, events)}
                        className={`cursor-pointer rounded-2xl p-2 sm:p-3 min-h-[140px] text-left flex flex-col transition-all duration-300 shadow-inner
                            ${isToday ? "bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30" : events.length > 0 ? "bg-zinc-800/60 border border-white/10 hover:bg-zinc-800" : "bg-zinc-900/30 border border-transparent hover:border-white/5 hover:bg-zinc-900/60"}`}>
                        <div className="mb-3">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isToday ? "text-blue-300" : "text-zinc-500"}`}>{DAYS[d.getDay()]}</span>
                            <p className={`text-xl font-mono font-black leading-tight mt-0.5 ${isToday ? "text-blue-400" : "text-white"}`}>{d.getDate()}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                            {evs.slice(0, 1).map(e => (
                                <span key={e.id} className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg truncate border shadow-inner ${isToday ? "bg-blue-500/30 text-blue-200 border-blue-500/20" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/20"}`}>{e.title}</span>
                            ))}
                            {tasks.slice(0, 2).map(e => (
                                <span key={e.id} className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg truncate border shadow-inner ${isToday ? "bg-blue-500/30 text-blue-200 border-blue-500/20" : e.overdue ? "bg-rose-500/20 text-rose-300 border-rose-500/20" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/20"}`}>{e.title}</span>
                            ))}
                            {tss.slice(0, 1).map(e => (
                                <span key={e.id} className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg truncate border shadow-inner ${isToday ? "bg-blue-500/30 text-blue-200 border-blue-500/20" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"}`}>{e.title}</span>
                            ))}
                            {events.length > 4 && <span className={`text-[10px] font-mono font-bold mt-1 ${isToday ? "text-blue-300/70" : "text-zinc-500"}`}>+{events.length - 4} more</span>}
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
    const shade = (n) => { 
        if (!n) return "bg-zinc-800/50 border border-white/5"; 
        const r = n / maxCount; 
        if (r < 0.25) return "bg-cyan-900/50 border border-cyan-500/20 shadow-[0_0_10px_rgba(8,145,178,0.2)]"; 
        if (r < 0.5) return "bg-cyan-700/60 border border-cyan-400/30 shadow-[0_0_10px_rgba(8,145,178,0.4)]"; 
        if (r < 0.75) return "bg-cyan-500/80 border border-cyan-300/40 shadow-[0_0_12px_rgba(34,211,238,0.6)]"; 
        return "bg-cyan-400 border border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)]"; 
    };

    return (
        <div className="space-y-4">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Each square = 1 day. Brighter = more activity.</p>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-1.5 min-w-max">
                    {weeks.map((wk, wi) => (
                        <div key={wi} className="flex flex-col gap-1.5">
                            {[...Array(7)].map((_, di) => {
                                const c = wk[di];
                                if (!c) return <div key={di} className="h-3.5 w-3.5" />;
                                return (
                                    <div key={di} title={`${fmt(c.dt, { month: "short", day: "numeric" })} — ${c.count} event${c.count !== 1 ? "s" : ""}`}
                                        className={`h-3.5 w-3.5 rounded-[4px] ${shade(c.count)} transition-all duration-300 hover:scale-125 cursor-crosshair`} />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider pt-2 border-t border-white/5">
                <span>Less</span>
                {["bg-zinc-800/50 border-white/5", "bg-cyan-900/50 border-cyan-500/20", "bg-cyan-700/60 border-cyan-400/30", "bg-cyan-500/80 border-cyan-300/40", "bg-cyan-400 border-cyan-300"].map((c, i) => (
                    <span key={i} className={`h-3.5 w-3.5 rounded-[4px] border ${c}`} />
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
    const isEvent = event.type === "event";
    const evStyle = isEvent ? (EVENT_TYPE_STYLE[event.eventType] || EVENT_TYPE_STYLE.Event) : null;
    const EvIcon = evStyle?.icon;
    
    // Dynamic styling based on event type for dark mode
    let borderBgClass = "";
    let iconBgClass = "";
    let iconClass = "";

    if (isTask) {
        if (event.overdue) {
            borderBgClass = "bg-rose-500/5 border-rose-500/20";
            iconBgClass = "bg-rose-500/10 border border-rose-500/20";
            iconClass = "text-rose-400";
        } else {
            borderBgClass = "bg-cyan-500/5 border-cyan-500/20";
            iconBgClass = "bg-cyan-500/10 border border-cyan-500/20";
            iconClass = "text-cyan-400";
        }
    } else if (isEvent) {
        borderBgClass = evStyle.badge;
        iconBgClass = evStyle.badge.replace('text-', 'border border-').replace('text', 'border'); // Simplified approach for icon bg
        iconClass = evStyle.badge.split(' ').find(c => c.startsWith('text-'));
    } else { // timesheet
        borderBgClass = "bg-emerald-500/5 border-emerald-500/20";
        iconBgClass = "bg-emerald-500/10 border border-emerald-500/20";
        iconClass = "text-emerald-400";
    }

    return (
        <div className={`flex items-start gap-3 px-3.5 py-3 rounded-2xl border shadow-inner ${borderBgClass}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${iconBgClass}`}>
                {isTask
                    ? <ClipboardCheck size={16} className={`stroke-[2.5] ${iconClass}`} />
                    : isEvent
                        ? <EvIcon size={16} className={`stroke-[2.5] ${iconClass}`} />
                        : <Clock3 size={16} className={`stroke-[2.5] ${iconClass}`} />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-mono font-bold text-white truncate">{event.title}</p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                    {isTask
                        ? `${event.priority} · ${event.status}${event.overdue ? " · ⚠ Overdue" : ""}`
                        : isEvent
                            ? `${event.eventType} · ${to12h(event.time)}`
                            : `${event.hours}h logged · ${event.workMode}`}
                </p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS & HOLIDAYS PANEL — every admin-created event, filterable by type
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_FILTER_TABS = ["All", "Meeting", "Holiday", "Announcement", "Deadline", "Event"];

const EventsHolidaysPanel = ({ adminEvents, loading, filter, setFilter, onSelect }) => {
    const list = useMemo(() => {
        return adminEvents
            .filter(ev => filter === "All" || ev.type === filter)
            .slice()
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [adminEvents, filter]);

    return (
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3.5 mb-5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
                    <Megaphone size={18} className="text-purple-400 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Events & Holidays</h3>
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">{loading ? "Loading…" : `${list.length} total`}</p>
                </div>
            </div>

            {!loading && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {EVENT_FILTER_TABS.map(t => (
                        <button key={t} type="button" onClick={() => setFilter(t)}
                            className={`cursor-pointer text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border transition-all shadow-inner active:scale-95 uppercase tracking-wider
                                ${filter === t ? "bg-zinc-950 text-cyan-400 border-white/10 shadow-lg" : "bg-zinc-900/50 text-zinc-500 border-white/5 hover:text-white hover:bg-zinc-800"}`}>
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <SidebarSkeleton />
            ) : list.length === 0 ? (
                <div className="border border-dashed border-white/10 bg-zinc-900/20 rounded-2xl py-10 text-center">
                    <Megaphone size={28} className="mx-auto text-zinc-600 mb-3" />
                    <p className="text-sm font-mono font-bold text-zinc-400">No events found</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">Try a different filter</p>
                </div>
            ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {list.map(ev => {
                        const style = EVENT_TYPE_STYLE[ev.type] || EVENT_TYPE_STYLE.Event;
                        const Icon = style.icon;
                        const d = new Date(ev.date);
                        return (
                            <button key={ev._id} type="button" onClick={() => onSelect(ev)}
                                className="cursor-pointer w-full flex items-start gap-3 px-3.5 py-3 rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-white/10 shadow-inner hover:shadow-lg transition-all text-left group">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                                    <Icon size={16} className="stroke-[2.5]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-mono font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{ev.title}</p>
                                        <span className={`shrink-0 text-[9px] font-mono font-bold px-2 py-1 rounded-md border shadow-inner uppercase tracking-wider ${style.badge}`}>{ev.type}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-zinc-400 mt-1.5 uppercase tracking-wider">{fmt(d, { day: "numeric", month: "short", year: "numeric" })} · {to12h(ev.time)}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENT DETAIL MODAL — full view of a single event/holiday/announcement
// ─────────────────────────────────────────────────────────────────────────────

const EventDetailModal = ({ event, onClose }) => {
    if (!event) return null;
    const style = EVENT_TYPE_STYLE[event.type] || EVENT_TYPE_STYLE.Event;
    const Icon = style.icon;
    const d = new Date(event.date);
    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[85vh] flex flex-col animate-[modalPop_.2s_ease] relative overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Top Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>

                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${style.badge}`}>
                            <Icon size={20} className="stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                            <span className={`inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner uppercase tracking-wider ${style.badge}`}>{event.type}</span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition shrink-0 shadow-inner">
                        <X size={16} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar">
                    <h2 className="text-xl font-mono font-black text-white leading-snug break-words">{event.title}</h2>

                    <div className="flex flex-wrap gap-2.5">
                        <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-300 shadow-inner">
                            <CalendarDays size={14} className="text-cyan-400 stroke-[2.5]" />
                            {fmt(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-300 shadow-inner">
                            <Clock3 size={14} className="text-cyan-400 stroke-[2.5]" />
                            {to12h(event.time)}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2.5">Description</p>
                        <p className="text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                            {event.description?.trim() ? event.description : "No description added."}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-white/5 shrink-0 bg-zinc-950/40">
                    <button type="button" onClick={onClose}
                        className="cursor-pointer w-full h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs sm:text-sm font-mono font-bold transition shadow-inner active:scale-95">
                        Close Details
                    </button>
                </div>
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
    const [adminEvents, setAdminEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [showTasks, setShowTasks] = useState(true);
    const [showTimesheets, setShowTimesheets] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [eventTypeFilter, setEventTypeFilter] = useState("All");

    // Modal
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedAdminEvent, setSelectedAdminEvent] = useState(null);

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const [tRes, tsRes, evRes] = await Promise.allSettled([
                axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS),
                axiosInstance.get(API_PATHS.TIMESHEET.GET_MY_TIMESHEETS),
                axiosInstance.get(API_PATHS.EVENTS.GET_ALL),
            ]);
            if (tRes.status === "fulfilled") {
                const raw = tRes.value.data?.tasks || tRes.value.data || [];
                setTasks(Array.isArray(raw) ? raw : []);
            }
            if (tsRes.status === "fulfilled") {
                const raw = tsRes.value.data?.data || tsRes.value.data || [];
                setTimesheets(Array.isArray(raw) ? raw : []);
            }
            if (evRes.status === "fulfilled") {
                const raw = evRes.value.data?.events || evRes.value.data || [];
                setAdminEvents(Array.isArray(raw) ? raw : []);
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

        if (showEvents) {
            adminEvents.forEach(ev => {
                if (!ev.date) return;
                if (q && !(ev.title || "").toLowerCase().includes(q) && !(ev.description || "").toLowerCase().includes(q)) return;
                const d = new Date(ev.date);
                add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, {
                    id: ev._id, type: "event",
                    title: ev.title || "Event",
                    description: ev.description || "",
                    eventType: ev.type || "Event",
                    time: ev.time || "",
                    date: d,
                });
            });
        }
        return map;
    }, [tasks, timesheets, adminEvents, showTasks, showTimesheets, showEvents, priorityFilter, searchQuery]);

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
        evCount: adminEvents.length,
    }), [tasks, timesheets, adminEvents]);

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

    const hasData = stats.total > 0 || stats.tsCount > 0 || stats.evCount > 0;
    const weekLabel = `${fmt(weekStart, { month: "short", day: "numeric" })} – ${fmt(new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)), { month: "short", day: "numeric", year: "numeric" })}`;

    // Inline style injections for animations
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .animate-shimmer { animation: shimmer 2s infinite linear; }
            @keyframes modalPop { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn .2s ease; }
            .custom-scrollbar::-webkit-scrollbar { width:4px; height:4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // ── RENDER ─────────────────────────────────────────────────────────────
    return (
        <DashboardLayout activeMenu="Calendar">
            <div className="space-y-6">

                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Calendar</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Tasks, timesheets, company events and your schedule</p>
                    </div>
                    <button type="button" onClick={() => fetchData({ isRefresh: true })} disabled={loading || refreshing}
                        className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all self-start sm:self-auto shadow-inner">
                        <RefreshCcw size={16} className={`${refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} stroke-[2.5]`} />
                        Refresh
                    </button>
                </div>

                {/* STAT PILLS */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: "Total Tasks", value: stats.total, icon: <ClipboardCheck size={18} className="stroke-[2.5]" />, style: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                            { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={18} className="stroke-[2.5]" />, style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                            { label: "Overdue", value: stats.overdue, icon: <AlertCircle size={18} className="stroke-[2.5]" />, style: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
                            { label: "Timesheets", value: stats.tsCount, icon: <Clock3 size={18} className="stroke-[2.5]" />, style: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                            { label: "Hours Logged", value: `${stats.tsHours}h`, icon: <Clock3 size={18} className="stroke-[2.5]" />, style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                            { label: "Events", value: stats.evCount, icon: <Megaphone size={18} className="stroke-[2.5]" />, style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                        ].map(({ label, value, icon, style }) => (
                            <div key={label} className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${style}`}>{icon}</div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider truncate">{label}</p>
                                    <p className="text-lg font-mono font-black text-white mt-0.5 truncate">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MONTH SUMMARY BANNER */}
                {!loading && (
                    <div className="bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 backdrop-blur-3xl border border-blue-500/20 rounded-[2rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
                            <div>
                                <p className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{MONTHS[month]} {year}</p>
                                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Month Summary</h2>
                            </div>
                            <div className="flex flex-wrap gap-4 sm:gap-6 bg-zinc-950/50 border border-white/5 rounded-2xl p-4 shadow-inner">
                                {[
                                    { label: "Tasks Due", val: monthStats.due },
                                    { label: "Completed", val: monthStats.done },
                                    { label: "Hours Logged", val: `${monthStats.hrs}h` },
                                    { label: "Completion", val: `${monthStats.pct}%` },
                                ].map(({ label, val }) => (
                                    <div key={label} className="text-center">
                                        <p className="text-lg sm:text-xl font-mono font-black text-white">{val}</p>
                                        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {monthStats.due > 0 && (
                            <div className="mt-6 relative z-10">
                                <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    <span>Task Progress</span>
                                    <span className="text-cyan-400">{monthStats.done}/{monthStats.due} tasks</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-zinc-900 border border-white/5 shadow-inner overflow-hidden">
                                    <div className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${monthStats.pct}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SEARCH + FILTERS (CLEANED NO DOUBLE CARD) */}
                {!loading && (
                    <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between pb-1">
                        
                        {/* SEARCH */}
                        <div className="relative flex-1 w-full max-w-xl shrink-0">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none stroke-[2.5]" />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search tasks, projects or events..."
                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/10 bg-zinc-950/80 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:outline-none placeholder-zinc-500 transition-all shadow-inner" />
                        </div>

                        {/* HORIZONTAL SCROLLABLE FILTERS ON MOBILE */}
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 w-full xl:w-auto">
                            
                            {/* EVENT TYPE TABS (Exact TaskStatusTabs Styling Inline) */}
                            <div className='flex overflow-x-auto scrollbar-hide gap-1.5 sm:gap-2 px-1 min-w-max'>
                                <FilterToggle label="Tasks" active={showTasks} onClick={() => setShowTasks(v => !v)} icon={<ClipboardCheck size={14} />} />
                                <FilterToggle label="Timesheets" active={showTimesheets} onClick={() => setShowTimesheets(v => !v)} icon={<Clock3 size={14} />} />
                                <FilterToggle label="Events" active={showEvents} onClick={() => setShowEvents(v => !v)} icon={<Megaphone size={14} />} />
                            </div>

                            {/* PRIORITY DROPDOWN */}
                            <div className="relative shrink-0 min-w-[130px]">
                                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                                    className="appearance-none w-full h-10 px-4 rounded-xl border border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 font-mono text-xs focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:outline-none cursor-pointer transition-all shadow-inner">
                                    {["All", "High", "Medium", "Low"].map(p => <option className="bg-zinc-900 text-white" key={p} value={p}>{p} Priority</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            {/* VIEW MODE TABS (Using Imported TaskStatusTabs component structure) */}
                            <div className='flex overflow-x-auto scrollbar-hide min-w-max'>
                                <TaskStatusTabs
                                    tabs={[
                                        { label: "Month", count: <LayoutGrid size={14} /> },
                                        { label: "Week", count: <CalendarRange size={14} /> },
                                        { label: "Heat", count: <List size={14} /> },
                                    ]}
                                    activeTab={view === "heatmap" ? "Heat" : view === "week" ? "Week" : "Month"}
                                    setActiveTab={(lbl) => setView(lbl === "Heat" ? "heatmap" : lbl.toLowerCase())}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CALENDAR + SIDEBAR ────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* MAIN CALENDAR */}
                    <div className="flex-1 w-full bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)] min-w-0">
                        {loading ? <Skeleton /> : (
                            <>
                                {/* Nav */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                    <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide truncate pr-4">
                                        {view === "week" ? weekLabel : view === "heatmap" ? `${year} Activity` : `${MONTHS[month]} ${year}`}
                                    </h2>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button type="button" onClick={view === "week" ? prevWeek : prevMonth}
                                            className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition shadow-inner active:scale-95">
                                            <ChevronLeft size={16} className="text-cyan-400 stroke-[2.5]" />
                                        </button>
                                        <button type="button" onClick={goToday}
                                            className="cursor-pointer h-9 px-4 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition text-xs font-mono font-bold text-zinc-300 hover:text-white shadow-inner active:scale-95">
                                            Today
                                        </button>
                                        <button type="button" onClick={view === "week" ? nextWeek : nextMonth}
                                            className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition shadow-inner active:scale-95">
                                            <ChevronRight size={16} className="text-cyan-400 stroke-[2.5]" />
                                        </button>
                                    </div>
                                </div>

                                {/* MONTH VIEW */}
                                {view === "month" && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1.5 mb-2">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider py-2">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1.5">
                                            {calendarDays.map((cell, idx) => {
                                                const key = cell.current ? `${year}-${month}-${cell.day}` : null;
                                                const events = (key && eventMap[key]) || [];
                                                const taskEvs = events.filter(e => e.type === "task");
                                                const tsEvs = events.filter(e => e.type === "timesheet");
                                                const cEvs = events.filter(e => e.type === "event");
                                                const overdue = taskEvs.some(e => e.overdue);
                                                const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                                const hl = searchQuery && events.length > 0;
                                                return (
                                                    <button key={idx} type="button" disabled={!cell.current} onClick={() => openCell(cell)}
                                                        className={`cursor-pointer rounded-2xl p-1.5 sm:p-2.5 min-h-[70px] sm:min-h-[110px] text-left flex flex-col transition-all duration-300 shadow-inner
                                                            ${!cell.current ? "opacity-0 pointer-events-none"
                                                                : isToday ? "bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30"
                                                                    : overdue ? "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
                                                                        : hl ? "ring-2 ring-amber-400/50 bg-amber-500/10 hover:bg-amber-500/20 border-transparent"
                                                                            : events.length > 0 ? "bg-zinc-800/60 border border-white/10 hover:bg-zinc-800"
                                                                                : "bg-zinc-900/30 border border-transparent hover:border-white/5 hover:bg-zinc-900/60"}`}>
                                                        <span className={`text-xs sm:text-sm font-mono font-black leading-none mb-2
                                                            ${isToday ? "text-blue-400" : overdue ? "text-rose-400" : "text-white"}`}>
                                                            {cell.day}
                                                        </span>
                                                        <div className="hidden sm:flex flex-col gap-1.5 w-full">
                                                            {cEvs.slice(0, 1).map(e => (
                                                                <span key={e.id} className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border truncate shadow-inner
                                                                    ${isToday ? "bg-blue-500/30 text-blue-200 border-blue-500/20" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/20"}`}>{e.title}</span>
                                                            ))}
                                                            {taskEvs.slice(0, 2).map(e => (
                                                                <span key={e.id} className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border truncate shadow-inner
                                                                    ${isToday ? "bg-blue-500/30 text-blue-200 border-blue-500/20" : e.overdue ? "bg-rose-500/20 text-rose-300 border-rose-500/20" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/20"}`}>{e.title}</span>
                                                            ))}
                                                            {tsEvs.slice(0, 1).map(e => (
                                                                <span key={e.id} className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border truncate shadow-inner
                                                                    ${isToday ? "bg-blue-500/30 text-blue-200 border-blue-500/20" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"}`}>{e.title}</span>
                                                            ))}
                                                            {events.length > 4 && <span className={`text-[9px] sm:text-[10px] font-mono font-bold mt-0.5 ${isToday ? "text-blue-300/70" : "text-zinc-500"}`}>+{events.length - 4} more</span>}
                                                        </div>
                                                        {events.length > 0 && (
                                                            <div className="flex sm:hidden gap-1 mt-auto flex-wrap justify-center w-full">
                                                                {cEvs.length > 0 && <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-blue-300" : "bg-indigo-400"}`} />}
                                                                {taskEvs.length > 0 && <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-blue-300" : overdue ? "bg-rose-400" : "bg-cyan-400"}`} />}
                                                                {tsEvs.length > 0 && <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-blue-300/70" : "bg-emerald-400"}`} />}
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
                                        <div className="grid grid-cols-7 gap-1.5 mb-2">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider py-2">{d}</div>)}
                                        </div>
                                        <WeekView weekStart={weekStart} eventMap={eventMap} today={today} onDayClick={openDay} />
                                    </>
                                )}

                                {/* HEATMAP VIEW */}
                                {view === "heatmap" && <HeatmapView year={year} eventMap={eventMap} />}

                                {/* Legend */}
                                {view !== "heatmap" && (
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-6 pt-5 border-t border-white/5">
                                        {[
                                            { color: "bg-cyan-500/40 border-cyan-500/50", label: "Task due" },
                                            { color: "bg-emerald-500/40 border-emerald-500/50", label: "Timesheet" },
                                            { color: "bg-indigo-500/40 border-indigo-500/50", label: "Event/Hol." },
                                            { color: "bg-rose-500/40 border-rose-500/50", label: "Overdue" },
                                            { color: "bg-blue-600/40 border-blue-400/50 ring-2 ring-blue-500/30 ring-offset-zinc-950", label: "Today" },
                                        ].map(({ color, label }) => (
                                            <div key={label} className="flex items-center gap-2">
                                                <span className={`h-3 w-3 rounded-[4px] border shrink-0 ${color}`} />
                                                <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SIDEBAR — Today's Agenda + Upcoming */}
                    <div className="w-full lg:w-72 xl:w-[340px] flex flex-col gap-6 shrink-0">

                        {/* TODAY'S AGENDA */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center gap-3.5 mb-5">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <CalendarDays size={18} className="text-blue-400 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Today's Agenda</h3>
                                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">{fmt(today, { weekday: "long", day: "numeric", month: "short" })}</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : todayEvents.length === 0 ? (
                                <div className="border border-dashed border-white/10 bg-zinc-900/20 rounded-2xl py-8 text-center">
                                    <CalendarDays size={28} className="mx-auto text-zinc-600 mb-3" />
                                    <p className="text-sm font-mono font-bold text-zinc-400">Nothing today</p>
                                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">Enjoy your clear day!</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {todayEvents.map(e => <EventItem key={e.id} event={e} />)}
                                </div>
                            )}
                        </div>

                        {/* UPCOMING — next 7 days */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center gap-3.5 mb-5">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <CalendarRange size={18} className="text-indigo-400 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Upcoming (7 Days)</h3>
                                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">{upcomingDays.reduce((s, d) => s + d.events.length, 0)} events ahead</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : upcomingDays.length === 0 ? (
                                <div className="border border-dashed border-white/10 bg-zinc-900/20 rounded-2xl py-8 text-center">
                                    <CheckCircle2 size={28} className="mx-auto text-zinc-600 mb-3 stroke-[2.5]" />
                                    <p className="text-sm font-mono font-bold text-zinc-400">All clear ahead!</p>
                                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">No events in the next 7 days</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                    {upcomingDays.map(({ date, events }) => (
                                        <div key={dateKey(date)}>
                                            <p className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                                {isSameDay(date, today) ? "Today" : fmt(date, { weekday: "short", day: "numeric", month: "short" })}
                                            </p>
                                            <div className="space-y-2">
                                                {events.slice(0, 3).map(e => {
                                                    const isTask = e.type === "task";
                                                    const isEvent = e.type === "event";
                                                    const evStyle = isEvent ? (EVENT_TYPE_STYLE[e.eventType] || EVENT_TYPE_STYLE.Event) : null;
                                                    
                                                    let borderBgClass = "";
                                                    let iconClass = "";
                                                    if (isTask) {
                                                        borderBgClass = e.overdue ? "bg-rose-500/5 border-rose-500/20" : "bg-cyan-500/5 border-cyan-500/20";
                                                        iconClass = e.overdue ? "bg-rose-500" : "bg-cyan-500";
                                                    } else if (isEvent) {
                                                        borderBgClass = evStyle.badge;
                                                        iconClass = evStyle.badge.split(' ').find(c => c.startsWith('text-'))?.replace('text-', 'bg-') || "bg-indigo-500";
                                                    } else {
                                                        borderBgClass = "bg-emerald-500/5 border-emerald-500/20";
                                                        iconClass = "bg-emerald-500";
                                                    }

                                                    return (
                                                        <div key={e.id} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-inner ${borderBgClass}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 shadow-inner ${iconClass}`} />
                                                            <span className="text-xs font-mono font-bold text-white truncate flex-1">{e.title}</span>
                                                            {e.overdue && <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 shrink-0">OD</span>}
                                                        </div>
                                                    )
                                                })}
                                                {events.length > 3 && <p className="text-[10px] font-mono font-bold text-zinc-500 pl-1.5">+{events.length - 3} more</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* EVENTS & HOLIDAYS */}
                        <EventsHolidaysPanel
                            adminEvents={adminEvents}
                            loading={loading}
                            filter={eventTypeFilter}
                            setFilter={setEventTypeFilter}
                            onSelect={setSelectedAdminEvent}
                        />
                    </div>
                </div>

                {/* EMPTY STATE */}
                {!loading && !hasData && (
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <CalendarDays size={36} className="text-cyan-400 stroke-[2.5]" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">Your calendar is clear</h3>
                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                            No tasks, timesheets or events yet. Once your team assigns tasks, approves timesheets, or admin publishes an event, they'll show up here.
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

            {/* EVENT DETAIL MODAL */}
            {selectedAdminEvent && (
                <EventDetailModal
                    event={selectedAdminEvent}
                    onClose={() => setSelectedAdminEvent(null)}
                />
            )}

        </DashboardLayout>
    );
};

export default Calendar;