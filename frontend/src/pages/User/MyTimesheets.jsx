import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import {
    ClipboardList,
    Clock3,
    Search,
    RefreshCcw,
    Users,
    TrendingUp,
    Download,
    ArrowUpDown,
    CalendarRange,
    FolderKanban,
} from "lucide-react";

import TimesheetCard from "../../components/timesheet/Timesheetcard.jsx";
import TimesheetDetailsModal from "../../components/timesheet/Timesheetdetailsmodal.jsx";
import TimesheetSkeleton from "../../components/timesheet/TimesheetSkeleton.jsx";

import { getMyTimesheets } from "../../utils/timesheetService.js";

const AUTO_REFRESH_INTERVAL_MS = 60 * 1000; // 1 minute

const DATE_RANGE_OPTIONS = [
    { label: "All Time", value: "all" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
];

const SORT_OPTIONS = [
    { label: "Date (Newest)", value: "date_desc" },
    { label: "Date (Oldest)", value: "date_asc" },
    { label: "Hours (Highest)", value: "hours_desc" },
    { label: "Hours (Lowest)", value: "hours_asc" },
    { label: "Employee (A-Z)", value: "name_asc" },
];

const isInDateRange = (dateStr, range) => {
    if (range === "all") return true;

    const date = new Date(dateStr);
    const now = new Date();

    if (range === "week") {
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay());
        firstDay.setHours(0, 0, 0, 0);

        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 7);

        return date >= firstDay && date < lastDay;
    }

    if (range === "month") {
        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth()
        );
    }

    return true;
};

const escapeCsvValue = (value) => {
    const str = String(value ?? "");

    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
};

const MyTimesheets = () => {

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [timesheets, setTimesheets] = useState([]);
    const [search, setSearch] = useState("");

    const [dateRange, setDateRange] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date_desc");

    const [viewingTimesheet, setViewingTimesheet] = useState(null);

    const autoRefreshRef = useRef(null);

    const fetchData = async ({ isRefresh = false } = {}) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const res = await getMyTimesheets();

            setTimesheets(res.data?.data || []);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // INITIAL LOAD
    useEffect(() => {
        fetchData();
    }, []);

    // AUTO-REFRESH every 1 minute
    useEffect(() => {
        autoRefreshRef.current = setInterval(() => {
            fetchData({ isRefresh: true });
        }, AUTO_REFRESH_INTERVAL_MS);

        return () => clearInterval(autoRefreshRef.current);
    }, []);

    const handleRefresh = () => {
        fetchData({ isRefresh: true });
    };

    // UNIQUE PROJECT LIST
    const projectOptions = useMemo(() => {
        const projects = new Set(
            timesheets.map((t) => t.project).filter(Boolean)
        );
        return Array.from(projects).sort();
    }, [timesheets]);

    // FILTER + SEARCH + SORT
    const filteredTimesheets = useMemo(() => {
        const query = search.trim().toLowerCase();

        let result = timesheets.filter((t) => {
            const employeeName = t.employeeName || t.employee?.name || "";
            const employeeEmail = t.employeeEmail || t.employee?.email || "";
            const project = t.project || "";

            const matchesSearch =
                !query ||
                employeeName.toLowerCase().includes(query) ||
                employeeEmail.toLowerCase().includes(query) ||
                project.toLowerCase().includes(query);

            const matchesDateRange = isInDateRange(t.date, dateRange);

            const matchesProject =
                projectFilter === "all" || t.project === projectFilter;

            return matchesSearch && matchesDateRange && matchesProject;
        });

        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case "date_asc":
                    return new Date(a.date) - new Date(b.date);
                case "date_desc":
                    return new Date(b.date) - new Date(a.date);
                case "hours_asc":
                    return (a.totalHours || 0) - (b.totalHours || 0);
                case "hours_desc":
                    return (b.totalHours || 0) - (a.totalHours || 0);
                case "name_asc": {
                    const nameA = (a.employeeName || a.employee?.name || "").toLowerCase();
                    const nameB = (b.employeeName || b.employee?.name || "").toLowerCase();
                    return nameA.localeCompare(nameB);
                }
                default:
                    return 0;
            }
        });

        return result;
    }, [timesheets, search, dateRange, projectFilter, sortBy]);

    // SUMMARY STATS
    const totalHours = useMemo(
        () => timesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0),
        [timesheets]
    );

    const uniqueEmployeeCount = useMemo(() => {
        const ids = new Set(
            timesheets.map(
                (t) => t.employee?._id || t.employee || t.employeeEmail
            )
        );
        return ids.size;
    }, [timesheets]);

    const avgHoursPerEntry = timesheets.length
        ? Math.round((totalHours / timesheets.length) * 10) / 10
        : 0;

    // EXPORT TO CSV
    const handleExportCsv = () => {
        if (filteredTimesheets.length === 0) return;

        const headers = [
            "Employee",
            "Email",
            "Date",
            "Project",
            "Attendance",
            "Work Mode",
            "Clock In",
            "Clock Out",
            "Break (min)",
            "Total Hours",
            "Overtime (hrs)",
            "Notes",
        ];

        const rows = filteredTimesheets.map((t) => [
            t.employeeName || t.employee?.name || "",
            t.employeeEmail || t.employee?.email || "",
            t.date ? new Date(t.date).toLocaleDateString("en-IN") : "",
            t.project || "",
            t.attendanceStatus || "",
            t.workMode || "",
            t.clockIn || "",
            t.clockOut || "",
            t.breakMinutes ?? 0,
            t.totalHours ?? 0,
            t.overtimeHours ?? 0,
            t.notes || "",
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map(escapeCsvValue).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `timesheets_${new Date().toISOString().split("T")[0]}.csv`
        );

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const hasActiveFilters =
        search.trim() !== "" || dateRange !== "all" || projectFilter !== "all";

    const resetFilters = () => {
        setSearch("");
        setDateRange("all");
        setProjectFilter("all");
        setSortBy("date_desc");
    };

    return (
        <DashboardLayout activeMenu="My Timesheets">

            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Timesheets
                        </h1>

                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                            All approved timesheets across the team
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                        {/* SEARCH (Increased Width on Desktop) */}
                        <div className="relative flex-1 md:min-w-[320px] lg:min-w-[400px] xl:min-w-[500px]">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search employee or project..."
                                className="w-full h-12 sm:h-11 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner"
                            />
                        </div>

                        <div className="flex gap-3">
                            {/* REFRESH (Text visible on mobile too) */}
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading || refreshing}
                                className="cursor-pointer flex-1 sm:flex-none h-12 sm:h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner shrink-0"
                            >
                                <RefreshCcw
                                    size={16}
                                    className={`${refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} stroke-[2.5]`}
                                />
                                <span>Refresh</span>
                            </button>

                            {/* EXPORT (Text visible on mobile, cursor pointer fixed) */}
                            <div className={`relative group shrink-0 flex-1 sm:flex-none ${filteredTimesheets.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    type="button"
                                    onClick={handleExportCsv}
                                    disabled={filteredTimesheets.length === 0}
                                    className="relative cursor-pointer h-12 sm:h-11 px-4 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 disabled:active:scale-100 w-full disabled:cursor-not-allowed"
                                >
                                    <Download size={16} className="text-cyan-400 stroke-[2.5]" />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-blue-500/20 rounded-2xl px-5 py-4 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full pointer-events-none"></div>
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                            <Clock3 size={18} className="text-blue-400 stroke-[2.5]" />
                        </div>

                        <div className="min-w-0 relative z-10">
                            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Total Hours</p>
                            <p className="text-xl font-mono font-black text-white truncate mt-0.5">
                                {totalHours} <span className="text-sm font-bold text-zinc-500">hrs</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl px-5 py-4 flex items-center gap-3.5 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full pointer-events-none"></div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                            <Users size={18} className="text-emerald-400 stroke-[2.5]" />
                        </div>

                        <div className="min-w-0 relative z-10">
                            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Employees</p>
                            <p className="text-xl font-mono font-black text-white truncate mt-0.5">
                                {uniqueEmployeeCount}
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-950/60 backdrop-blur-3xl border border-amber-500/20 rounded-2xl px-5 py-4 flex items-center gap-3.5 shadow-inner relative overflow-hidden col-span-2 sm:col-span-1">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full pointer-events-none"></div>
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                            <TrendingUp size={18} className="text-amber-400 stroke-[2.5]" />
                        </div>

                        <div className="min-w-0 relative z-10">
                            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Avg Hrs/Entry</p>
                            <p className="text-xl font-mono font-black text-white truncate mt-0.5">
                                {avgHoursPerEntry} <span className="text-sm font-bold text-zinc-500">hrs</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* FILTER BAR (Cleaned up Double Card issue - Standard Native Selects) */}
                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                    {/* DATE RANGE */}
                    <div className="relative flex-1 min-w-[160px]">
                        <CalendarRange size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none stroke-[2.5] z-10" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="appearance-none w-full h-11 pl-11 pr-4 rounded-xl border border-white/10 bg-zinc-900/80 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:outline-none cursor-pointer transition-all shadow-inner relative"
                        >
                            {DATE_RANGE_OPTIONS.map((opt) => (
                                <option className="bg-zinc-900 text-white" key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom Dropdown Arrow SVG */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-cyan-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* PROJECT FILTER */}
                    <div className="relative flex-1 min-w-[160px]">
                        <FolderKanban size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none stroke-[2.5] z-10" />
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="appearance-none w-full h-11 pl-11 pr-4 rounded-xl border border-white/10 bg-zinc-900/80 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:outline-none cursor-pointer transition-all shadow-inner relative"
                        >
                            <option className="bg-zinc-900 text-white" value="all">All Projects</option>
                            {projectOptions.map((project) => (
                                <option className="bg-zinc-900 text-white" key={project} value={project}>
                                    {project}
                                </option>
                            ))}
                        </select>
                        {/* Custom Dropdown Arrow SVG */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-cyan-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* SORT */}
                    <div className="relative flex-1 min-w-[160px]">
                        <ArrowUpDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none stroke-[2.5] z-10" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none w-full h-11 pl-11 pr-4 rounded-xl border border-white/10 bg-zinc-900/80 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:outline-none cursor-pointer transition-all shadow-inner relative"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option className="bg-zinc-900 text-white" key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom Dropdown Arrow SVG */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-cyan-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="cursor-pointer h-11 px-4 rounded-xl text-xs font-mono font-bold text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all shrink-0"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
                {/* Body / List */}

                {!loading && timesheets.length > 0 && (
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs sm:text-sm font-mono text-zinc-400">
                            Showing{" "}
                            <span className="font-bold text-cyan-400">
                                {filteredTimesheets.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-cyan-400">
                                {timesheets.length}
                            </span>{" "}
                            timesheets
                        </p>
                    </div>
                )}

                {loading ? (
                    <TimesheetSkeleton />
                ) : timesheets.length === 0 ? (
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <ClipboardList size={36} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">
                            No approved timesheets yet
                        </h3>
                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                            Approved timesheets will appear here automatically.
                        </p>
                    </div>
                ) : filteredTimesheets.length === 0 ? (
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                            <Search size={36} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">
                            No timesheets match your filters
                        </h3>
                        <p className="text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm">
                            Try adjusting the search, date range, or project filter to see results.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {filteredTimesheets.map((timesheet) => (
                            <TimesheetCard
                                key={timesheet._id}
                                timesheet={timesheet}
                                onView={setViewingTimesheet}
                            />
                        ))}
                    </div>
                )}

                <TimesheetDetailsModal
                    open={!!viewingTimesheet}
                    timesheet={viewingTimesheet}
                    onClose={() => setViewingTimesheet(null)}
                />

            </div>

        </DashboardLayout>
    );
};

export default MyTimesheets;