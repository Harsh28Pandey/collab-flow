// src/pages/Admin/AdminCalendar.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    ChevronLeft, ChevronRight, RefreshCcw, CalendarDays,
    CalendarRange, LayoutGrid, List, Search, X, Plus, Pencil, Trash2,
    CheckCircle2, AlertCircle, Megaphone, Users, Clock3, Sparkles, Loader2,
} from "lucide-react";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const EVENT_TYPES = ["Event", "Meeting", "Announcement", "Deadline", "Holiday"];

const TYPE_STYLE = {
    Meeting: { dot: "bg-cyan-500", solid: "bg-cyan-600", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", ring: "ring-cyan-400" },
    Holiday: { dot: "bg-amber-500", solid: "bg-amber-600", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", ring: "ring-amber-400" },
    Announcement: { dot: "bg-purple-500", solid: "bg-purple-600", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", ring: "ring-purple-400" },
    Deadline: { dot: "bg-rose-500", solid: "bg-rose-600", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", ring: "ring-rose-400" },
    Event: { dot: "bg-indigo-500", solid: "bg-indigo-600", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", ring: "ring-indigo-400" },
};

const TYPE_ICON = { Meeting: Users, Holiday: CalendarDays, Announcement: Megaphone, Deadline: AlertCircle, Event: Sparkles };

const fmt = (d, opts) => new Date(d).toLocaleDateString("en-IN", opts);
const dateKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; };
const isSameDay = (a, b) => { const da = new Date(a), db = new Date(b); return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate(); };
const isPastDay = (d) => new Date(d) < new Date(new Date().setHours(0, 0, 0, 0));
const startOfWeek = (d) => { const dt = new Date(d); dt.setDate(dt.getDate() - dt.getDay()); dt.setHours(0, 0, 0, 0); return dt; };
const toInputDate = (d) => { const dt = new Date(d); const p = (n) => String(n).padStart(2, "0"); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`; };
const to12h = (t) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); const period = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2, "0")} ${period}`; };

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
            <div className="h-7 w-40 bg-zinc-900 rounded-xl" />
            <div className="flex gap-2">
                <div className="h-9 w-9 bg-zinc-900 rounded-xl" />
                <div className="h-9 w-20 bg-zinc-900 rounded-xl" />
                <div className="h-9 w-9 bg-zinc-900 rounded-xl" />
            </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => <div key={d} className="h-7 bg-zinc-900/60 rounded-lg" />)}
        </div>
        {[...Array(5)].map((_, r) => (
            <div key={r} className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, c) => <div key={c} className="h-20 sm:h-24 bg-zinc-950/60 border border-white/5 rounded-2xl" />)}
            </div>
        ))}
    </div>
);

const SidebarSkeleton = () => (
    <div className="animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-2xl">
                <div className="h-8 w-8 bg-zinc-900 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-zinc-900 rounded-full" />
                    <div className="h-2.5 w-1/2 bg-zinc-900/60 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3200);
        return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;
    const ok = toast.type === "success";
    return (
        <div className="fixed top-5 right-5 z-[10001] animate-[toastIn_.25s_ease]">
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-sm font-mono font-bold backdrop-blur-xl
                ${ok ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                {ok ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENT FORM MODAL (create + edit)
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: "", description: "", type: "Event", date: "", time: "" };

const EventFormModal = ({ open, initialData, onClose, onSubmit, submitting }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        if (initialData) {
            setForm({
                title: initialData.title || "",
                description: initialData.description || "",
                type: initialData.type || "Event",
                date: initialData.date ? toInputDate(initialData.date) : "",
                time: initialData.time || "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [open, initialData]);

    if (!open) return null;

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Event name is required";
        if (!form.description.trim()) errs.description = "Description is required";
        if (!form.type) errs.type = "Select a type";
        if (!form.date) errs.date = "Date is required";
        if (!form.time) errs.time = "Time is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(form);
    };

    const inputCls = (field) => `w-full h-11 px-4 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 transition [color-scheme:dark]
        ${errors[field] ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white" : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600"}`;

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 py-8 animate-fadeIn overflow-hidden" onClick={onClose}>
            <div className="w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease] my-auto" onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            {initialData ? <Pencil size={18} className="text-cyan-400" /> : <Plus size={20} className="text-cyan-400" />}
                        </div>
                        <div>
                            <h2 className="text-base font-mono font-black text-white tracking-wide">{initialData ? "Edit Event" : "Create Event"}</h2>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">Visible to every user's calendar</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition text-zinc-400 hover:text-white shadow-inner">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 custom-scrollbar">

                    <div>
                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Event Name <span className="text-rose-400">*</span></label>
                        <input type="text" value={form.title} onChange={set("title")} placeholder="e.g. Quarterly Town Hall"
                            className={inputCls("title")} />
                        {errors.title && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Description <span className="text-rose-400">*</span></label>
                        <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What is this event about?"
                            className={`${inputCls("description")} !h-auto py-3 resize-none`} />
                        {errors.description && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Type <span className="text-rose-400">*</span></label>
                            <select value={form.type} onChange={set("type")} className={`${inputCls("type")} cursor-pointer bg-zinc-900`}>
                                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Date <span className="text-rose-400">*</span></label>
                            <input type="date" value={form.date} onChange={set("date")} className={`${inputCls("date")} cursor-pointer`} />
                            {errors.date && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Time <span className="text-rose-400">*</span></label>
                        <input type="time" value={form.time} onChange={set("time")} className={`${inputCls("time")} cursor-pointer max-w-[200px]`} />
                        {errors.time && <p className="text-[11px] font-mono text-rose-400 mt-1">&gt; {errors.time}</p>}
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border p-3 border-cyan-500/25 bg-cyan-500/10 shadow-inner">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${TYPE_STYLE[form.type]?.dot || "bg-cyan-400"}`} />
                        <p className="text-xs font-mono text-cyan-300">This will appear as <span className="font-bold text-white">{form.type}</span> on everyone's calendar.</p>
                    </div>
                </form>

                <div className="px-5 py-4 border-t border-white/5 flex items-center justify-end gap-3 shrink-0 bg-zinc-950/40">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="relative cursor-pointer h-11 px-6 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 disabled:opacity-60">
                            {submitting ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : initialData ? <Pencil size={16} className="text-cyan-400 stroke-[3]" /> : <Plus size={16} className="text-cyan-400 stroke-[3]" />}
                            <span>{initialData ? "Save Changes" : "Create Event"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmDeleteModal = ({ event, onClose, onConfirm, deleting }) => {
    if (!event) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Trash2 size={20} className="text-rose-400" />
                </div>
                <h3 className="text-base font-mono font-black text-white text-center tracking-wide">Delete this event?</h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 text-center mt-1.5 leading-relaxed">
                    "{event.title}" will be removed from every user's calendar. This can't be undone.
                </p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                    <button type="button" onClick={onClose} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono font-bold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg active:scale-95">
                        {deleting && <Loader2 size={15} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DAY DETAIL MODAL (admin: view + edit + delete)
// ─────────────────────────────────────────────────────────────────────────────

const DayModal = ({ date, events, onClose, onEdit, onDelete }) => {
    if (!date) return null;
    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[85vh] flex flex-col animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            <CalendarDays size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-mono font-black text-white tracking-wide">
                                {fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </h2>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition text-zinc-400 hover:text-white shadow-inner">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-3 custom-scrollbar">
                    {events.length === 0 && (
                        <div className="text-center py-10">
                            <CalendarDays size={32} className="mx-auto text-zinc-600 mb-3" />
                            <p className="text-xs sm:text-sm font-mono text-zinc-400">No events on this day</p>
                        </div>
                    )}
                    {events.map(ev => {
                        const style = TYPE_STYLE[ev.type] || TYPE_STYLE.Event;
                        const Icon = TYPE_ICON[ev.type] || Sparkles;
                        return (
                            <div key={ev._id} className="rounded-2xl p-4 border border-white/5 bg-zinc-900/40 shadow-inner">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${style.badge} border shadow-inner`}>
                                            <Icon size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-mono font-bold text-white leading-snug break-words">{ev.title}</p>
                                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{to12h(ev.time)}</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-inner ${style.badge}`}>{ev.type}</span>
                                </div>
                                {ev.description && <p className="text-xs font-mono text-zinc-300 mt-3 leading-relaxed">{ev.description}</p>}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                                    <button type="button" onClick={() => onEdit(ev)}
                                        className="cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 transition shadow-inner active:scale-95">
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button type="button" onClick={() => onDelete(ev)}
                                        className="cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 transition shadow-inner active:scale-95">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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
                const isToday = isSameDay(d, today);
                return (
                    <button key={i} type="button" onClick={() => onDayClick(d, events)}
                        className={`cursor-pointer rounded-2xl p-2.5 min-h-[130px] text-left flex flex-col transition-all border
                            ${isToday
                                ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/40 shadow-inner"
                                : events.length > 0
                                    ? "bg-zinc-900/60 border-white/10 hover:border-white/20"
                                    : "bg-zinc-950/40 border-white/5 hover:border-white/10"}`}>
                        <div className="mb-2">
                            <span className={`text-[10px] font-mono uppercase tracking-wider ${isToday ? "text-cyan-400 font-bold" : "text-zinc-500"}`}>{DAYS[d.getDay()]}</span>
                            <p className={`text-lg font-mono font-black leading-tight ${isToday ? "text-white" : "text-zinc-200"}`}>{d.getDate()}</p>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            {events.slice(0, 3).map(e => {
                                const style = TYPE_STYLE[e.type] || TYPE_STYLE.Event;
                                return (
                                    <span key={e._id} className={`text-[10px] font-mono px-2 py-0.5 rounded-lg truncate text-white ${style.solid} shadow-inner`}>{e.title}</span>
                                );
                            })}
                            {events.length > 3 && <span className="text-[10px] font-mono text-zinc-500">+{events.length - 3} more</span>}
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
    const shade = (n) => { if (!n) return "bg-zinc-900 border border-white/5"; const r = n / maxCount; if (r < 0.25) return "bg-cyan-900 border border-cyan-700/40"; if (r < 0.5) return "bg-cyan-700"; if (r < 0.75) return "bg-cyan-500"; return "bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"; };

    return (
        <div className="space-y-4">
            <p className="text-xs font-mono text-zinc-400">Each square = 1 day. Glowing/Brighter = more events scheduled.</p>
            <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex gap-1.5 min-w-max">
                    {weeks.map((wk, wi) => (
                        <div key={wi} className="flex flex-col gap-1.5">
                            {[...Array(7)].map((_, di) => {
                                const c = wk[di];
                                if (!c) return <div key={di} className="h-3.5 w-3.5" />;
                                return (
                                    <div key={di} title={`${fmt(c.dt, { month: "short", day: "numeric" })} — ${c.count} event${c.count !== 1 ? "s" : ""}`}
                                        className={`h-3.5 w-3.5 rounded-sm ${shade(c.count)} transition-all hover:scale-125 cursor-pointer`} />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span>Less</span>
                {["bg-zinc-900 border border-white/5", "bg-cyan-900", "bg-cyan-700", "bg-cyan-500", "bg-cyan-400"].map((c, i) => (
                    <span key={i} className={`h-3.5 w-3.5 rounded-sm ${c}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENDA ROW (sidebar management list)
// ─────────────────────────────────────────────────────────────────────────────

const AgendaRow = ({ ev, onEdit, onDelete }) => {
    const style = TYPE_STYLE[ev.type] || TYPE_STYLE.Event;
    const Icon = TYPE_ICON[ev.type] || Sparkles;
    return (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-white/10 transition shadow-inner">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${style.badge} shadow-inner`}>
                <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-mono font-bold text-white truncate">{ev.title}</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{fmt(ev.date, { day: "numeric", month: "short" })} · {to12h(ev.time)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onEdit(ev)} title="Edit event" aria-label="Edit event"
                    className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center shrink-0 transition shadow-inner active:scale-95">
                    <Pencil size={13} />
                </button>
                <button type="button" onClick={() => onDelete(ev)} title="Delete event" aria-label="Delete event"
                    className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-rose-400 flex items-center justify-center shrink-0 transition shadow-inner active:scale-95">
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN CALENDAR PAGE
// ─────────────────────────────────────────────────────────────────────────────

const AdminCalendar = () => {
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [view, setView] = useState("month");
    const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);

    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchEvents = useCallback(async ({ isRefresh = false } = {}) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const res = await axiosInstance.get(API_PATHS.EVENTS.GET_ALL);
            const raw = res.data?.events || res.data || [];
            setEvents(Array.isArray(raw) ? raw : []);
        } catch (e) {
            console.log(e);
            showToast("Couldn't load events. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    // ── FILTERED EVENT MAP ─────────────────────────────────────────────────
    const eventMap = useMemo(() => {
        const map = {};
        const q = searchQuery.trim().toLowerCase();
        events.forEach(ev => {
            if (!ev.date) return;
            if (typeFilter !== "All" && ev.type !== typeFilter) return;
            if (q && !(ev.title || "").toLowerCase().includes(q) && !(ev.description || "").toLowerCase().includes(q)) return;
            const d = new Date(ev.date);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!map[key]) map[key] = [];
            map[key].push(ev);
        });
        Object.values(map).forEach(list => list.sort((a, b) => (a.time || "").localeCompare(b.time || "")));
        return map;
    }, [events, searchQuery, typeFilter]);

    const filteredEventsSorted = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return events
            .filter(ev => (typeFilter === "All" || ev.type === typeFilter))
            .filter(ev => !q || (ev.title || "").toLowerCase().includes(q) || (ev.description || "").toLowerCase().includes(q))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [events, searchQuery, typeFilter]);

    // ── CALENDAR GRID ──────────────────────────────────────────────────────
    const calendarDays = useMemo(() => {
        const first = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const prev = new Date(year, month, 0).getDate();
        const cells = [];
        for (let i = first - 1; i >= 0; i--)  cells.push({ day: prev - i, current: false, date: null });
        for (let d = 1; d <= days; d++)     cells.push({ day: d, current: true, date: new Date(year, month, d) });
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

    // ── CREATE / EDIT / DELETE ────────────────────────────────────────────
    const openCreate = () => { setEditingEvent(null); setFormOpen(true); };
    const openEdit = (ev) => { setEditingEvent(ev); setFormOpen(true); setSelectedDate(null); };

    const handleFormSubmit = async (form) => {
        try {
            setSubmitting(true);
            if (editingEvent) {
                await axiosInstance.put(API_PATHS.EVENTS.UPDATE(editingEvent._id), form);
                showToast("Event updated successfully");
            } else {
                await axiosInstance.post(API_PATHS.EVENTS.CREATE, form);
                showToast("Event created and published to all users");
            }
            setFormOpen(false);
            setEditingEvent(null);
            fetchEvents({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Something went wrong. Try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await axiosInstance.delete(API_PATHS.EVENTS.DELETE(deleteTarget._id));
            showToast("Event deleted");
            setDeleteTarget(null);
            setSelectedDate(null);
            fetchEvents({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't delete event.", "error");
        } finally {
            setDeleting(false);
        }
    };

    // ── STATS ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const upcoming = events.filter(e => e.date && !isPastDay(e.date)).length;
        const past = events.length - upcoming;
        const inMonth = events.filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month; }).length;
        return { total: events.length, upcoming, past, inMonth };
    }, [events, year, month]);

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

    const hasData = events.length > 0;
    const weekLabel = `${fmt(weekStart, { month: "short", day: "numeric" })} – ${fmt(new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)), { month: "short", day: "numeric", year: "numeric" })}`;

    // ── RENDER ─────────────────────────────────────────────────────────────
    return (
        <DashboardLayout activeMenu="Calendar">
            <div className="space-y-6">

                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Calendar & Agenda</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Create events that instantly show up on every user's calendar</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchEvents({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={openCreate}
                                className="relative cursor-pointer h-11 px-5 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95">
                                <Plus size={17} className="text-cyan-400 stroke-[3]" />
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>

                {/* STAT PILLS */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Total Events", value: stats.total, icon: <CalendarDays size={18} />, border: "border-cyan-500/20", glow: "bg-cyan-500/10", text: "text-cyan-400" },
                            { label: "This Month", value: stats.inMonth, icon: <CalendarRange size={18} />, border: "border-indigo-500/20", glow: "bg-indigo-500/10", text: "text-indigo-400" },
                            { label: "Upcoming", value: stats.upcoming, icon: <Clock3 size={18} />, border: "border-emerald-500/20", glow: "bg-emerald-500/10", text: "text-emerald-400" },
                            { label: "Past", value: stats.past, icon: <CheckCircle2 size={18} />, border: "border-white/10", glow: "bg-zinc-900", text: "text-zinc-400" },
                        ].map(({ label, value, icon, border, glow, text }) => (
                            <div key={label} className={`bg-zinc-950/60 backdrop-blur-3xl border ${border} rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden`}>
                                <div className={`h-10 w-10 rounded-xl ${glow} ${text} flex items-center justify-center shrink-0 border border-white/5 shadow-inner`}>{icon}</div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate">{label}</p>
                                    <p className="text-xl font-mono font-black text-white mt-0.5 truncate">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MONTH SUMMARY BANNER */}
                {!loading && (
                    <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 sm:p-6 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                            <div>
                                <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{MONTHS[month]} {year}</p>
                                <h2 className="text-lg sm:text-xl font-mono font-black mt-1 text-white">{stats.inMonth} event{stats.inMonth !== 1 ? "s" : ""} scheduled</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {EVENT_TYPES.map(t => {
                                    const count = events.filter(e => e.type === t).length;
                                    if (!count) return null;
                                    return (
                                        <span key={t} className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-300 shadow-inner">
                                            {t}: <span className="text-cyan-400">{count}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* SEARCH + FILTERS: Fully cleaned up, single row, no duplicate wrappers, custom dropdown & tabs */}
                {!loading && (
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2">
                        {/* Search Bar & Dropdown on Left side */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                            {/* Custom Dropdown Wrapper */}
                            <div className="relative w-full sm:w-auto shrink-0">
                                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                                    className="appearance-none w-full sm:w-auto h-12 pl-4 pr-11 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white cursor-pointer shadow-inner">
                                    {["All", ...EVENT_TYPES].map(t => <option key={t} value={t} className="bg-zinc-900 text-white">{t === "All" ? "All Types" : t}</option>)}
                                </select>
                                
                                {/* Custom Dropdown Arrow */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                </div>
                            </div>

                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none" />
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search events by title or description..."
                                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner" />
                            </div>
                        </div>

                        {/* Right Section: TaskStatusTabs-style View Selector */}
                        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">
                            <div className="min-w-max flex items-center gap-1.5 h-12">
                                <TaskStatusTabs
                                    tabs={[
                                        { label: "Month", count: null, icon: <LayoutGrid size={14} className="text-cyan-400" /> },
                                        { label: "Week", count: null, icon: <CalendarRange size={14} className="text-indigo-400" /> },
                                        { label: "Heat", count: null, icon: <List size={14} className="text-purple-400" /> }
                                    ]}
                                    activeTab={view === "month" ? "Month" : view === "week" ? "Week" : "Heat"}
                                    setActiveTab={(tab) => {
                                        if (tab === "Month") setView("month");
                                        else if (tab === "Week") setView("week");
                                        else if (tab === "Heat") setView("heatmap");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CALENDAR + SIDEBAR ────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* MAIN CALENDAR */}
                    <div className="flex-1 bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 min-w-0 shadow-[0_15px_50px_rgba(0,0,0,0.6)] w-full">
                        {loading ? <Skeleton /> : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-base sm:text-xl font-mono font-black text-white tracking-wide truncate">
                                        {view === "week" ? weekLabel : view === "heatmap" ? `${year} Activity` : `${MONTHS[month]} ${year}`}
                                    </h2>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button type="button" onClick={view === "week" ? prevWeek : prevMonth}
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white transition flex items-center justify-center shadow-inner">
                                            <ChevronLeft size={18} className="stroke-[2.5]" />
                                        </button>
                                        <button type="button" onClick={goToday}
                                            className="cursor-pointer h-10 px-4 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition text-xs sm:text-sm font-mono font-bold shadow-inner">
                                            Today
                                        </button>
                                        <button type="button" onClick={view === "week" ? nextWeek : nextMonth}
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white transition flex items-center justify-center shadow-inner">
                                            <ChevronRight size={18} className="stroke-[2.5]" />
                                        </button>
                                    </div>
                                </div>

                                {view === "month" && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1.5 mb-2">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest py-1">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1.5">
                                            {calendarDays.map((cell, idx) => {
                                                const key = cell.current ? `${year}-${month}-${cell.day}` : null;
                                                const evs = (key && eventMap[key]) || [];
                                                const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                                const hl = searchQuery && evs.length > 0;
                                                return (
                                                    <button key={idx} type="button" disabled={!cell.current} onClick={() => openCell(cell)}
                                                        className={`cursor-pointer rounded-2xl p-2 sm:p-2.5 min-h-[70px] sm:min-h-[100px] text-left flex flex-col transition-all duration-200 border
                                                            ${!cell.current ? "opacity-0 pointer-events-none"
                                                                : isToday ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                                                                    : hl ? "ring-2 ring-amber-400 bg-amber-500/10 border-amber-500/30"
                                                                        : evs.length > 0 ? "bg-zinc-900/80 border-white/10 hover:border-white/20"
                                                                            : "bg-zinc-950/40 border-white/5 hover:border-white/10"}`}>
                                                        <span className={`text-xs sm:text-sm font-mono font-bold leading-none mb-2 ${isToday ? "text-cyan-400" : "text-zinc-300"}`}>
                                                            {cell.day}
                                                        </span>
                                                        <div className="hidden sm:flex flex-col gap-1 w-full">
                                                            {evs.slice(0, 2).map(e => {
                                                                const style = TYPE_STYLE[e.type] || TYPE_STYLE.Event;
                                                                return (
                                                                    <span key={e._id} className={`text-[10px] font-mono px-2 py-0.5 rounded-lg truncate text-white ${style.solid} shadow-inner`}>{e.title}</span>
                                                                );
                                                            })}
                                                            {evs.length > 2 && <span className="text-[10px] font-mono text-zinc-500">+{evs.length - 2} more</span>}
                                                        </div>
                                                        {evs.length > 0 && (
                                                            <div className="flex sm:hidden gap-1 mt-auto flex-wrap">
                                                                {evs.slice(0, 4).map(e => {
                                                                    const style = TYPE_STYLE[e.type] || TYPE_STYLE.Event;
                                                                    return <span key={e._id} className={`h-2 w-2 rounded-full ${style.dot}`} />;
                                                                })}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {view === "week" && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1.5 mb-2">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest py-1">{d}</div>)}
                                        </div>
                                        <WeekView weekStart={weekStart} eventMap={eventMap} today={today} onDayClick={openDay} />
                                    </>
                                )}

                                {view === "heatmap" && <HeatmapView year={year} eventMap={eventMap} />}

                                {view !== "heatmap" && (
                                    <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-white/5">
                                        {EVENT_TYPES.map(t => (
                                            <div key={t} className="flex items-center gap-2">
                                                <span className={`h-3 w-3 rounded-md shrink-0 ${TYPE_STYLE[t].solid} shadow-inner`} />
                                                <span className="text-xs font-mono text-zinc-400">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-5 shrink-0">

                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <CalendarDays size={18} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Today's Agenda</h3>
                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{fmt(today, { weekday: "long", day: "numeric", month: "short" })}</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : todayEvents.length === 0 ? (
                                <div className="border border-dashed border-white/10 rounded-2xl py-8 text-center bg-zinc-900/20">
                                    <CalendarDays size={26} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-xs font-mono text-zinc-400">Nothing scheduled today</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {todayEvents.map(ev => <AgendaRow key={ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />)}
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <CalendarRange size={18} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Upcoming (7 Days)</h3>
                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{upcomingDays.reduce((s, d) => s + d.events.length, 0)} events ahead</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : upcomingDays.length === 0 ? (
                                <div className="border border-dashed border-white/10 rounded-2xl py-8 text-center bg-zinc-900/20">
                                    <CheckCircle2 size={26} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-xs font-mono text-zinc-400">Nothing in the next 7 days</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                                    {upcomingDays.flatMap(({ events: evs }) => evs).map(ev => (
                                        <AgendaRow key={ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* MANAGE ALL EVENTS */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <List size={18} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Manage Events</h3>
                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{filteredEventsSorted.length} matching event{filteredEventsSorted.length !== 1 ? "s" : ""}</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : filteredEventsSorted.length === 0 ? (
                                <div className="border border-dashed border-white/10 rounded-2xl py-8 text-center bg-zinc-900/20">
                                    <Search size={26} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-xs font-mono text-zinc-400">No events found</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                    {filteredEventsSorted.map(ev => <AgendaRow key={ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {!loading && !hasData && (
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <CalendarDays size={36} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">No events yet</h3>
                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                            Create your first event or announcement — it'll show up instantly on every user's calendar.
                        </p>
                        <div className="relative group cursor-pointer mt-6">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={openCreate}
                                className="relative cursor-pointer h-12 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-lg">
                                <Plus size={16} className="text-cyan-400 stroke-[3]" /> Create Event
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {selectedDate && (
                <DayModal
                    date={selectedDate}
                    events={selectedEvents}
                    onClose={() => { setSelectedDate(null); setSelectedEvents([]); }}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                />
            )}

            <EventFormModal
                open={formOpen}
                initialData={editingEvent}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditingEvent(null); }}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDeleteModal
                event={deleteTarget}
                deleting={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
            />

            <Toast toast={toast} onClose={() => setToast(null)} />

            <style>{`
                @keyframes modalPop {
                    from { opacity:0; transform:scale(.96) translateY(10px); }
                    to   { opacity:1; transform:scale(1) translateY(0); }
                }
                @keyframes toastIn {
                    from { opacity:0; transform:translateY(-8px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn .2s ease; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width:4px; height:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminCalendar;