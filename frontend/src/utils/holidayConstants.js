import { Thermometer, Coffee, Award, Home, CircleDollarSign, Clock3, CheckCircle2, XCircle } from "lucide-react";

export const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Work From Home", "Unpaid Leave"];

export const LEAVE_TYPE_STYLE = {
    "Sick Leave": { icon: Thermometer, badge: "bg-red-50 text-red-700 border-red-200", solid: "bg-red-500" },
    "Casual Leave": { icon: Coffee, badge: "bg-blue-50 text-blue-700 border-blue-200", solid: "bg-blue-500" },
    "Earned Leave": { icon: Award, badge: "bg-purple-50 text-purple-700 border-purple-200", solid: "bg-purple-500" },
    "Work From Home": { icon: Home, badge: "bg-teal-50 text-teal-700 border-teal-200", solid: "bg-teal-500" },
    "Unpaid Leave": { icon: CircleDollarSign, badge: "bg-gray-100 text-gray-700 border-gray-200", solid: "bg-gray-400" },
};

export const HOLIDAY_STATUSES = ["Pending", "Approved", "Rejected"];

export const STATUS_STYLE = {
    Pending: { icon: Clock3, badge: "bg-amber-50 text-amber-700 border-amber-200", solid: "bg-amber-500" },
    Approved: { icon: CheckCircle2, badge: "bg-green-50 text-green-700 border-green-200", solid: "bg-green-500" },
    Rejected: { icon: XCircle, badge: "bg-red-50 text-red-700 border-red-200", solid: "bg-red-500" },
};

export const fmtDate = (d, opts) => new Date(d).toLocaleDateString("en-IN", opts || { day: "numeric", month: "short", year: "numeric" });

export const toInputDate = (d) => {
    const dt = new Date(d);
    const p = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
};

export const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const start = new Date(new Date(from).setHours(0, 0, 0, 0));
    const end = new Date(new Date(to).setHours(0, 0, 0, 0));
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

export const formatDateRange = (from, to) => {
    const f = new Date(from), t = new Date(to);
    const sameMonth = f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear();
    const sameDay = f.toDateString() === t.toDateString();
    if (sameDay) return fmtDate(f);
    if (sameMonth) return `${f.getDate()} – ${fmtDate(t)}`;
    return `${fmtDate(f)} – ${fmtDate(t)}`;
};