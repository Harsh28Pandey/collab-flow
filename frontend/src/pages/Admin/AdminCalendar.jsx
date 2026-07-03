import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    ChevronLeft, ChevronRight, RefreshCcw, CalendarDays,
    CalendarRange, LayoutGrid, List, Search, X, Plus, Pencil, Trash2,
    CheckCircle2, AlertCircle, Megaphone, Users, Clock3, Sparkles, Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const EVENT_TYPES = ["Event", "Meeting", "Announcement", "Deadline", "Holiday"];

const TYPE_STYLE = {
    Meeting: { dot: "bg-blue-500", solid: "bg-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200", ring: "ring-blue-400" },
    Holiday: { dot: "bg-amber-500", solid: "bg-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200", ring: "ring-amber-400" },
    Announcement: { dot: "bg-purple-500", solid: "bg-purple-600", badge: "bg-purple-50 text-purple-700 border-purple-200", ring: "ring-purple-400" },
    Deadline: { dot: "bg-red-500", solid: "bg-red-600", badge: "bg-red-50 text-red-700 border-red-200", ring: "ring-red-400" },
    Event: { dot: "bg-indigo-500", solid: "bg-indigo-600", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", ring: "ring-indigo-400" },
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
            <div className={`flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl shadow-xl border text-sm font-medium
                ${ok ? "bg-blue-600 border-blue-700 text-white" : "bg-red-600 border-red-700 text-white"}`}>
                {ok ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {toast.message}
                <button type="button" onClick={onClose} className="cursor-pointer ml-1 h-6 w-6 rounded-lg hover:bg-white/20 flex items-center justify-center">
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

    const inputCls = (field) => `w-full h-11 px-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 transition
        ${errors[field] ? "border-red-300 focus:ring-red-400 bg-red-50/40" : "border-gray-200 focus:ring-blue-500"}`;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-[26px] shadow-2xl max-h-[90vh] flex flex-col animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                            {initialData ? <Pencil size={18} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">{initialData ? "Edit Event" : "Create Event"}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Visible to every user's calendar</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer h-9 w-9 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 custom-scrollbar">

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.title} onChange={set("title")} placeholder="e.g. Quarterly Town Hall"
                            className={inputCls("title")} />
                        {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-500">*</span></label>
                        <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What is this event about?"
                            className={`${inputCls("description")} !h-auto py-3 resize-none`} />
                        {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type <span className="text-red-500">*</span></label>
                            <select value={form.type} onChange={set("type")} className={`${inputCls("type")} cursor-pointer bg-white`}>
                                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date <span className="text-red-500">*</span></label>
                            <input type="date" value={form.date} onChange={set("date")} className={`${inputCls("date")} cursor-pointer`} />
                            {errors.date && <p className="text-[11px] text-red-500 mt-1">{errors.date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time <span className="text-red-500">*</span></label>
                        <input type="time" value={form.time} onChange={set("time")} className={`${inputCls("time")} cursor-pointer max-w-[200px]`} />
                        {errors.time && <p className="text-[11px] text-red-500 mt-1">{errors.time}</p>}
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border p-3 border-blue-100 bg-blue-50">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${TYPE_STYLE[form.type]?.dot || "bg-blue-500"}`} />
                        <p className="text-xs text-blue-700">This will appear as <span className="font-semibold">{form.type}</span> on everyone's calendar.</p>
                    </div>
                </form>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                        className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2">
                        {submitting && <Loader2 size={15} className="animate-spin" />}
                        {initialData ? "Save Changes" : "Create Event"}
                    </button>
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
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-[26px] shadow-2xl p-6 animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center">Delete this event?</h3>
                <p className="text-sm text-gray-500 text-center mt-1.5">
                    "{event.title}" will be removed from every user's calendar. This can't be undone.
                </p>
                <div className="flex items-center gap-3 mt-6">
                    <button type="button" onClick={onClose} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="cursor-pointer flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
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
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-[26px] shadow-2xl max-h-[85vh] flex flex-col animate-[modalPop_.2s_ease]" onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
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

                <div className="overflow-y-auto flex-1 p-5 space-y-2.5 custom-scrollbar">
                    {events.length === 0 && (
                        <div className="text-center py-10">
                            <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">No events on this day</p>
                        </div>
                    )}
                    {events.map(ev => {
                        const style = TYPE_STYLE[ev.type] || TYPE_STYLE.Event;
                        const Icon = TYPE_ICON[ev.type] || Sparkles;
                        return (
                            <div key={ev._id} className="rounded-2xl p-3.5 border border-gray-200 bg-gray-50/60">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${style.badge} border`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 leading-snug break-words">{ev.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{to12h(ev.time)}</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>{ev.type}</span>
                                </div>
                                {ev.description && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{ev.description}</p>}
                                <div className="flex items-center gap-2 mt-3">
                                    <button type="button" onClick={() => onEdit(ev)}
                                        className="cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-gray-600 transition">
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button type="button" onClick={() => onDelete(ev)}
                                        className="cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 transition">
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
                        className={`cursor-pointer rounded-2xl p-2 min-h-[120px] text-left flex flex-col transition-all
                            ${isToday ? "bg-blue-600" : events.length > 0 ? "bg-blue-50 border border-blue-200 hover:bg-blue-100" : "bg-gray-50 border border-transparent hover:bg-gray-100"}`}>
                        <div className="mb-2">
                            <span className={`text-[10px] font-semibold uppercase ${isToday ? "text-white/70" : "text-gray-400"}`}>{DAYS[d.getDay()]}</span>
                            <p className={`text-lg font-bold leading-tight ${isToday ? "text-white" : "text-gray-800"}`}>{d.getDate()}</p>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            {events.slice(0, 3).map(e => {
                                const style = TYPE_STYLE[e.type] || TYPE_STYLE.Event;
                                return (
                                    <span key={e._id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg truncate text-white ${isToday ? "bg-white/20" : style.solid}`}>{e.title}</span>
                                );
                            })}
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
            <p className="text-xs text-gray-500">Each square = 1 day. Darker = more events scheduled.</p>
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
// AGENDA ROW (sidebar management list)
// ─────────────────────────────────────────────────────────────────────────────

const AgendaRow = ({ ev, onEdit, onDelete }) => {
    const style = TYPE_STYLE[ev.type] || TYPE_STYLE.Event;
    const Icon = TYPE_ICON[ev.type] || Sparkles;
    return (
        <div className="group flex items-start gap-2.5 px-3 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 transition">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}>
                <Icon size={13} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmt(ev.date, { day: "numeric", month: "short" })} · {to12h(ev.time)}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button type="button" onClick={() => onEdit(ev)} className="cursor-pointer h-7 w-7 rounded-lg hover:bg-blue-100 flex items-center justify-center">
                    <Pencil size={12} className="text-blue-600" />
                </button>
                <button type="button" onClick={() => onDelete(ev)} className="cursor-pointer h-7 w-7 rounded-lg hover:bg-red-100 flex items-center justify-center">
                    <Trash2 size={12} className="text-red-600" />
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
            <div className="space-y-5">

                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar & Agenda</h1>
                        <p className="text-sm text-gray-500 mt-1">Create events that instantly show up on every user's calendar</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={() => fetchEvents({ isRefresh: true })} disabled={loading || refreshing}
                            className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button type="button" onClick={openCreate}
                            className="cursor-pointer h-11 px-4 sm:px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-blue-200">
                            <Plus size={17} />
                            Create Event
                        </button>
                    </div>
                </div>

                {/* STAT PILLS */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Total Events", value: stats.total, icon: <CalendarDays size={16} />, bg: "bg-blue-100", text: "text-blue-600" },
                            { label: "This Month", value: stats.inMonth, icon: <CalendarRange size={16} />, bg: "bg-indigo-100", text: "text-indigo-600" },
                            { label: "Upcoming", value: stats.upcoming, icon: <Clock3 size={16} />, bg: "bg-green-100", text: "text-green-600" },
                            { label: "Past", value: stats.past, icon: <CheckCircle2 size={16} />, bg: "bg-gray-200", text: "text-gray-600" },
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-sm text-white/70 font-medium">{MONTHS[month]} {year}</p>
                                <h2 className="text-xl font-bold mt-0.5">{stats.inMonth} event{stats.inMonth !== 1 ? "s" : ""} scheduled</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {EVENT_TYPES.map(t => {
                                    const count = events.filter(e => e.type === t).length;
                                    if (!count) return null;
                                    return (
                                        <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                                            {t}: {count}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* SEARCH + FILTERS */}
                {!loading && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search events by title or description..."
                                className="w-full h-10 pl-10 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>

                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                            className="h-10 px-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer">
                            {["All", ...EVENT_TYPES].map(t => <option key={t}>{t}</option>)}
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

                                {view === "month" && (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {calendarDays.map((cell, idx) => {
                                                const key = cell.current ? `${year}-${month}-${cell.day}` : null;
                                                const evs = (key && eventMap[key]) || [];
                                                const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                                const hl = searchQuery && evs.length > 0;
                                                return (
                                                    <button key={idx} type="button" disabled={!cell.current} onClick={() => openCell(cell)}
                                                        className={`cursor-pointer rounded-2xl p-1.5 sm:p-2 min-h-[64px] sm:min-h-[90px] text-left flex flex-col transition-all duration-150
                                                            ${!cell.current ? "opacity-0 pointer-events-none"
                                                                : isToday ? "bg-blue-600 hover:bg-blue-700"
                                                                    : hl ? "ring-2 ring-amber-400 bg-amber-50 hover:bg-amber-100"
                                                                        : evs.length > 0 ? "bg-blue-50 border border-blue-200 hover:bg-blue-100"
                                                                            : "bg-gray-50 border border-transparent hover:bg-gray-100 hover:border-gray-200"}`}>
                                                        <span className={`text-xs sm:text-sm font-semibold leading-none mb-1.5 ${isToday ? "text-white" : "text-gray-700"}`}>
                                                            {cell.day}
                                                        </span>
                                                        <div className="hidden sm:flex flex-col gap-1 w-full">
                                                            {evs.slice(0, 2).map(e => {
                                                                const style = TYPE_STYLE[e.type] || TYPE_STYLE.Event;
                                                                return (
                                                                    <span key={e._id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg truncate text-white ${isToday ? "bg-white/20" : style.solid}`}>{e.title}</span>
                                                                );
                                                            })}
                                                            {evs.length > 2 && <span className={`text-[10px] ${isToday ? "text-white/70" : "text-gray-400"}`}>+{evs.length - 2} more</span>}
                                                        </div>
                                                        {evs.length > 0 && (
                                                            <div className="flex sm:hidden gap-0.5 mt-auto flex-wrap">
                                                                {evs.slice(0, 4).map(e => {
                                                                    const style = TYPE_STYLE[e.type] || TYPE_STYLE.Event;
                                                                    return <span key={e._id} className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : style.dot}`} />;
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
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {DAYS.map(d => <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">{d}</div>)}
                                        </div>
                                        <WeekView weekStart={weekStart} eventMap={eventMap} today={today} onDayClick={openDay} />
                                    </>
                                )}

                                {view === "heatmap" && <HeatmapView year={year} eventMap={eventMap} />}

                                {view !== "heatmap" && (
                                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                                        {EVENT_TYPES.map(t => (
                                            <div key={t} className="flex items-center gap-1.5">
                                                <span className={`h-3 w-3 rounded-sm shrink-0 ${TYPE_STYLE[t].solid}`} />
                                                <span className="text-xs text-gray-500">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-5 shrink-0">

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
                                    <p className="text-sm font-medium text-gray-600">Nothing scheduled today</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {todayEvents.map(ev => <AgendaRow key={ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />)}
                                </div>
                            )}
                        </div>

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
                                    <p className="text-sm font-medium text-gray-600">Nothing in the next 7 days</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                                    {upcomingDays.flatMap(({ events: evs }) => evs).map(ev => (
                                        <AgendaRow key={ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* MANAGE ALL EVENTS */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="h-9 w-9 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                    <List size={16} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Manage Events</h3>
                                    <p className="text-xs text-gray-400">{filteredEventsSorted.length} matching event{filteredEventsSorted.length !== 1 ? "s" : ""}</p>
                                </div>
                            </div>
                            {loading ? <SidebarSkeleton /> : filteredEventsSorted.length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-2xl py-8 text-center">
                                    <Search size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm font-medium text-gray-600">No events found</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                    {filteredEventsSorted.map(ev => <AgendaRow key={ev._id} ev={ev} onEdit={openEdit} onDelete={setDeleteTarget} />)}
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
                        <h3 className="text-lg font-bold text-gray-800">No events yet</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                            Create your first event or announcement — it'll show up instantly on every user's calendar.
                        </p>
                        <button type="button" onClick={openCreate}
                            className="cursor-pointer mt-5 h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2">
                            <Plus size={16} /> Create Event
                        </button>
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
                    from { opacity:0; transform:scale(.96); }
                    to   { opacity:1; transform:scale(1); }
                }
                @keyframes toastIn {
                    from { opacity:0; transform:translateY(-8px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width:4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminCalendar;