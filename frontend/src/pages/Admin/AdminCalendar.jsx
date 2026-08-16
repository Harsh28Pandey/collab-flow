import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    ChevronLeft, ChevronRight, RefreshCcw, CalendarDays,
    CalendarRange, LayoutGrid, List, Search, X, Plus, Pencil, Trash2,
    CheckCircle2, AlertCircle, Megaphone, Users, Clock3, Sparkles, Loader2,
    ClipboardCheck
} from "lucide-react";
import TaskStatusTabs from "../../components/TaskStatusTabs.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const EVENT_TYPES = ["Event", "Meeting", "Announcement", "Deadline", "Holiday"];

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

const TYPE_STYLE = {
    Meeting: { dot: "bg-cyan-500", solid: "bg-cyan-600", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", ring: "ring-cyan-400", icon: Users },
    Holiday: { dot: "bg-amber-500", solid: "bg-amber-600", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", ring: "ring-amber-400", icon: CalendarDays },
    Announcement: { dot: "bg-purple-500", solid: "bg-purple-600", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", ring: "ring-purple-400", icon: Megaphone },
    Deadline: { dot: "bg-rose-500", solid: "bg-rose-600", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", ring: "ring-rose-400", icon: AlertCircle },
    Event: { dot: "bg-indigo-500", solid: "bg-indigo-600", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", ring: "ring-indigo-400", icon: Sparkles },
};

const fmt = (d, opts) => new Date(d).toLocaleDateString("en-IN", opts);
const dateKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; };
const isSameDay = (a, b) => { const da = new Date(a), db = new Date(b); return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate(); };
const isPast = (d) => new Date(d) < new Date(new Date().setHours(0, 0, 0, 0));
const startOfWeek = (d) => { const dt = new Date(d); dt.setDate(dt.getDate() - dt.getDay()); dt.setHours(0, 0, 0, 0); return dt; };
const toInputDate = (d) => { const dt = new Date(d); const p = (n) => String(n).padStart(2, "0"); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`; };
const to12h = (t) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); const period = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2, "0")} ${period}`; };

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS
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
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border text-sm font-mono font-bold backdrop-blur-xl
                ${ok ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                {ok ? <CheckCircle2 size={17} className="stroke-[2.5]" /> : <AlertCircle size={17} className="stroke-[2.5]" />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TOGGLE HELPER (Mimicking TaskStatusTabs for Multi-selects)
// ─────────────────────────────────────────────────────────────────────────────

const FilterToggle = ({ label, active, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${active
                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5'
            }`}
    >
        <div className='flex items-center gap-2'>
            <span>{label}</span>
            <span
                className={`text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 flex items-center justify-center rounded-full ${active
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
        ${errors[field] ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white" : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600 shadow-inner"}`;

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 py-8 animate-fadeIn overflow-hidden" onClick={onClose}>
            <div className="w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease] my-auto relative" onClick={e => e.stopPropagation()}>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>

                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            {initialData ? <Pencil size={20} className="text-cyan-400 stroke-[2.5]" /> : <Plus size={22} className="text-cyan-400 stroke-[3]" />}
                        </div>
                        <div>
                            <h2 className="text-base font-mono font-black text-white tracking-wide">{initialData ? "Edit Event" : "Create Event"}</h2>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">Visible to every user's calendar</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition text-zinc-400 hover:text-white shadow-inner">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar">

                    <div>
                        <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Event Name <span className="text-rose-400">*</span></label>
                        <input type="text" value={form.title} onChange={set("title")} placeholder="e.g. Quarterly Town Hall"
                            className={inputCls("title")} />
                        {errors.title && <p className="text-[11px] font-mono text-rose-400 mt-1.5">&gt; {errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Description <span className="text-rose-400">*</span></label>
                        <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What is this event about?"
                            className={`${inputCls("description")} !h-auto py-3 resize-none`} />
                        {errors.description && <p className="text-[11px] font-mono text-rose-400 mt-1.5">&gt; {errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Type <span className="text-rose-400">*</span></label>
                            <select value={form.type} onChange={set("type")} className={`${inputCls("type")} cursor-pointer bg-zinc-900 appearance-none`}>
                                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Date <span className="text-rose-400">*</span></label>
                            <input type="date" value={form.date} onChange={set("date")} className={`${inputCls("date")} cursor-pointer`} />
                            {errors.date && <p className="text-[11px] font-mono text-rose-400 mt-1.5">&gt; {errors.date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] sm:text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Time <span className="text-rose-400">*</span></label>
                        <input type="time" value={form.time} onChange={set("time")} className={`${inputCls("time")} cursor-pointer w-full sm:max-w-[200px]`} />
                        {errors.time && <p className="text-[11px] font-mono text-rose-400 mt-1.5">&gt; {errors.time}</p>}
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border p-3.5 border-cyan-500/25 bg-cyan-500/10 shadow-inner">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${TYPE_STYLE[form.type]?.text || "text-cyan-400"} ${TYPE_STYLE[form.type]?.dot || "bg-cyan-400"}`} />
                        <p className="text-xs font-mono text-cyan-200">This will appear as <span className="font-bold text-white">{form.type}</span> on everyone's calendar.</p>
                    </div>
                </form>

                <div className="px-6 py-5 border-t border-white/5 flex items-center justify-end gap-3 shrink-0 bg-zinc-950/40">
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
            <div className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 animate-[modalPop_.2s_ease] relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Trash2 size={24} className="text-rose-400 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-mono font-black text-white text-center tracking-wide">Delete this event?</h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 text-center mt-2 leading-relaxed">
                    "{event.title}" will be removed from every user's calendar. This can't be undone.
                </p>
                <div className="flex items-center gap-3 mt-7 pt-5 border-t border-white/5">
                    <button type="button" onClick={onClose} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-300 text-xs sm:text-sm font-mono font-bold hover:bg-zinc-800 hover:text-white transition shadow-inner disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono font-bold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg active:scale-95">
                        {deleting && <Loader2 size={15} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DAY DETAIL MODAL (Admin: view + edit + delete events)
// ─────────────────────────────────────────────────────────────────────────────

const DayModal = ({ date, events, onClose, onEdit, onDelete }) => {
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
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">{events.length} item{events.length !== 1 ? "s" : ""}</p>
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
                                    const style = TYPE_STYLE[e.eventType] || TYPE_STYLE.Event;
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
                                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                                                <button type="button" onClick={() => onEdit(e.raw)}
                                                    className="cursor-pointer flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 transition shadow-inner active:scale-95">
                                                    <Pencil size={12} /> Edit
                                                </button>
                                                <button type="button" onClick={() => onDelete(e.raw)}
                                                    className="cursor-pointer flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 transition shadow-inner active:scale-95">
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
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
// AGENDA ROW (sidebar management list)
// ─────────────────────────────────────────────────────────────────────────────

const AgendaRow = ({ ev, onEdit, onDelete }) => {
    const isTask = ev.type === "task";
    const isEvent = ev.type === "event";
    const evStyle = isEvent ? (TYPE_STYLE[ev.eventType] || TYPE_STYLE.Event) : null;
    const EvIcon = evStyle?.icon;

    let borderBgClass = "";
    let iconBgClass = "";
    let iconClass = "";

    if (isTask) {
        if (ev.overdue) {
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
        iconBgClass = evStyle.badge.replace('text-', 'border border-').replace('text', 'border');
        iconClass = evStyle.badge.split(' ').find(c => c.startsWith('text-'));
    } else { // timesheet
        borderBgClass = "bg-emerald-500/5 border-emerald-500/20";
        iconBgClass = "bg-emerald-500/10 border border-emerald-500/20";
        iconClass = "text-emerald-400";
    }

    return (
        <div className={`flex items-start gap-3 px-3.5 py-3 rounded-2xl border shadow-inner ${borderBgClass}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${iconBgClass}`}>
                {isTask ? <ClipboardCheck size={16} className={`stroke-[2.5] ${iconClass}`} />
                    : isEvent ? <EvIcon size={16} className={`stroke-[2.5] ${iconClass}`} />
                        : <Clock3 size={16} className={`stroke-[2.5] ${iconClass}`} />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-mono font-bold text-white truncate">{ev.title}</p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                    {isTask ? `${ev.priority} · ${ev.status}`
                        : isEvent ? `${ev.eventType} · ${to12h(ev.time)}`
                            : `${ev.hours}h logged · ${ev.workMode}`}
                </p>
            </div>
            {isEvent && onEdit && onDelete && (
                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => onEdit(ev.raw)} title="Edit event" aria-label="Edit event"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 flex items-center justify-center shrink-0 transition shadow-inner active:scale-95">
                        <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => onDelete(ev.raw)} title="Delete event" aria-label="Delete event"
                        className="cursor-pointer h-8 w-8 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 flex items-center justify-center shrink-0 transition shadow-inner active:scale-95">
                        <Trash2 size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS & HOLIDAYS PANEL — admin management panel
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_FILTER_TABS = ["All", "Meeting", "Holiday", "Announcement", "Deadline", "Event"];

const ManageEventsPanel = ({ adminEvents, loading, filter, setFilter, onEdit, onDelete }) => {
    const list = useMemo(() => {
        return adminEvents
            .filter(ev => filter === "All" || ev.type === filter)
            .slice()
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(ev => ({
                id: ev._id, type: "event", title: ev.title || "Event",
                description: ev.description || "", eventType: ev.type || "Event",
                time: ev.time || "", date: new Date(ev.date), raw: ev
            }));
    }, [adminEvents, filter]);

    return (
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3.5 mb-5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
                    <List size={18} className="text-purple-400 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Manage Events</h3>
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">{loading ? "Loading…" : `${list.length} match${list.length !== 1 ? "es" : ""}`}</p>
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
                    <Search size={28} className="mx-auto text-zinc-600 mb-3" />
                    <p className="text-sm font-mono font-bold text-zinc-400">No events found</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">Try a different filter</p>
                </div>
            ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {list.map(ev => (
                        <AgendaRow key={ev.id} ev={ev} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            )}
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

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);

    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    // ── FETCH (Fetching all to compute stats just like User Calendar)
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
        } catch (e) {
            console.log(e);
            showToast("Couldn't load calendar data. Try refreshing.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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
                    raw: ev // Passing raw so admin can edit/delete
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
            fetchData({ isRefresh: true });
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
            fetchData({ isRefresh: true });
        } catch (e) {
            console.log(e);
            showToast(e?.response?.data?.message || "Couldn't delete event.", "error");
        } finally {
            setDeleting(false);
        }
    };

    // ── STATS ──────────────────────────────────────────────────────────────
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

    const hasData = tasks.length > 0 || timesheets.length > 0 || adminEvents.length > 0;
    const weekLabel = `${fmt(weekStart, { month: "short", day: "numeric" })} – ${fmt(new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)), { month: "short", day: "numeric", year: "numeric" })}`;

    // Inline style injections for animations
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .animate-shimmer { animation: shimmer 2s infinite linear; }
            @keyframes modalPop { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
            @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn .2s ease; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Calendar & Agenda</h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">Create events that instantly show up on every user's calendar</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto">
                        <button type="button" onClick={() => fetchData({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer flex-1 sm:flex-none h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <div className="relative group cursor-pointer flex-1 sm:flex-none">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button type="button" onClick={openCreate}
                                className="relative cursor-pointer w-full sm:w-auto h-11 px-4 sm:px-5 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                                <Plus size={17} className="text-cyan-400 stroke-[3]" />
                                Create Event
                            </button>
                        </div>
                    </div>
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
                            <div key={label} className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-xl rounded-full pointer-events-none"></div>
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner relative z-10 ${style}`}>{icon}</div>
                                <div className="min-w-0 relative z-10">
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

                {/* SEARCH + FILTERS (Cleaned Double Cards & Implemented TaskStatusTabs UI) */}
                {!loading && (
                    <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between pb-1">

                        {/* SEARCH */}
                        <div className="relative flex-1 w-full max-w-xl shrink-0">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none stroke-[2.5]" />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search tasks, projects or events..."
                                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:outline-none placeholder-zinc-500 transition-all shadow-inner" />
                        </div>

                        {/* HORIZONTAL SCROLLABLE FILTERS ON MOBILE */}
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 w-full xl:w-auto">

                            {/* EVENT TYPE TABS (TaskStatusTabs Logic & Styling Inline) */}
                            <div className='flex overflow-x-auto scrollbar-hide min-w-max'>
                                <div className='flex gap-1.5 sm:gap-2 px-1'>
                                    <button
                                        type="button"
                                        onClick={() => setShowTasks(v => !v)}
                                        className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${showTasks
                                                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5'
                                            }`}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <ClipboardCheck size={14} className={showTasks ? "stroke-[2.5]" : ""} />
                                            <span>Tasks</span>
                                        </div>
                                        {showTasks && <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowTimesheets(v => !v)}
                                        className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${showTimesheets
                                                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5'
                                            }`}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Clock3 size={14} className={showTimesheets ? "stroke-[2.5]" : ""} />
                                            <span>Timesheets</span>
                                        </div>
                                        {showTimesheets && <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowEvents(v => !v)}
                                        className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${showEvents
                                                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5'
                                            }`}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Megaphone size={14} className={showEvents ? "stroke-[2.5]" : ""} />
                                            <span>Events</span>
                                        </div>
                                        {showEvents && <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>}
                                    </button>
                                </div>
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

                            {/* VIEW MODE TABS (Using TaskStatusTabs logic) */}
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
                    <div className="flex-1 bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 min-w-0 shadow-[0_15px_50px_rgba(0,0,0,0.6)] w-full">
                        {loading ? <Skeleton /> : (
                            <>
                                {/* Nav */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                    <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide truncate pr-4">
                                        {view === "week" ? weekLabel : view === "heatmap" ? `${year} Activity` : `${MONTHS[month]} ${year}`}
                                    </h2>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button type="button" onClick={view === "week" ? prevWeek : prevMonth}
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white transition flex items-center justify-center shadow-inner">
                                            <ChevronLeft size={18} className="stroke-[2.5]" />
                                        </button>
                                        <button type="button" onClick={goToday}
                                            className="cursor-pointer h-10 px-4 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition text-xs sm:text-sm font-mono font-bold text-zinc-300 hover:text-white shadow-inner">
                                            Today
                                        </button>
                                        <button type="button" onClick={view === "week" ? nextWeek : nextMonth}
                                            className="cursor-pointer h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 hover:text-white transition flex items-center justify-center shadow-inner">
                                            <ChevronRight size={18} className="stroke-[2.5]" />
                                        </button>
                                    </div>
                                </div>

                                {/* MONTH VIEW */}
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
                                                                let style = TYPE_STYLE.Event;
                                                                if (e.type === "event") style = TYPE_STYLE[e.eventType] || TYPE_STYLE.Event;
                                                                else if (e.type === "task") style = { solid: e.overdue ? "bg-rose-500/20 text-rose-300 border border-rose-500/20" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/20" };
                                                                else if (e.type === "timesheet") style = { solid: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20" };

                                                                return (
                                                                    <span key={e.id} className={`text-[10px] font-mono px-2 py-0.5 rounded-lg truncate shadow-inner ${style.solid || style.badge}`}>{e.title}</span>
                                                                );
                                                            })}
                                                            {evs.length > 2 && <span className="text-[10px] font-mono text-zinc-500">+{evs.length - 2} more</span>}
                                                        </div>
                                                        {evs.length > 0 && (
                                                            <div className="flex sm:hidden gap-1 mt-auto flex-wrap">
                                                                {evs.slice(0, 4).map(e => {
                                                                    let dot = "bg-indigo-500";
                                                                    if (e.type === "event") dot = (TYPE_STYLE[e.eventType] || TYPE_STYLE.Event).dot;
                                                                    else if (e.type === "task") dot = e.overdue ? "bg-rose-500" : "bg-cyan-500";
                                                                    else if (e.type === "timesheet") dot = "bg-emerald-500";
                                                                    return <span key={e.id} className={`h-2 w-2 rounded-full ${dot}`} />;
                                                                })}
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
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest py-1">{d}</div>)}
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

                    {/* SIDEBAR */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-5 shrink-0">

                        {/* TODAY'S AGENDA */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <CalendarDays size={18} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Today's Agenda</h3>
                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">{fmt(today, { weekday: "long", day: "numeric", month: "short" })}</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : todayEvents.length === 0 ? (
                                <div className="border border-dashed border-white/10 rounded-2xl py-8 text-center bg-zinc-900/20">
                                    <CalendarDays size={26} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-xs font-mono text-zinc-400">Nothing scheduled today</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {todayEvents.map(ev => <AgendaRow key={ev.id || ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />)}
                                </div>
                            )}
                        </div>

                        {/* UPCOMING — next 7 days */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <CalendarRange size={18} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-bold text-white tracking-wide">Upcoming (7 Days)</h3>
                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">{upcomingDays.reduce((s, d) => s + d.events.length, 0)} events ahead</p>
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
                                        <AgendaRow key={ev.id || ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* MANAGE ALL EVENTS */}
                        <ManageEventsPanel
                            adminEvents={adminEvents}
                            loading={loading}
                            filter={eventTypeFilter}
                            setFilter={setEventTypeFilter}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                        />

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

        </DashboardLayout>
    );
};

export default AdminCalendar;