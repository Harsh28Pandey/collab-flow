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

    const [lastUpdated, setLastUpdated] = useState(null);

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
            setLastUpdated(new Date());

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

    // AUTO-REFRESH every 1 minute (silent, no skeleton — uses the refresh spinner state)
    useEffect(() => {
        autoRefreshRef.current = setInterval(() => {
            fetchData({ isRefresh: true });
        }, AUTO_REFRESH_INTERVAL_MS);

        return () => clearInterval(autoRefreshRef.current);
    }, []);

    const handleRefresh = () => {
        fetchData({ isRefresh: true });
    };

    // UNIQUE PROJECT LIST (for the filter dropdown)
    const projectOptions = useMemo(() => {
        const projects = new Set(
            timesheets.map((t) => t.project).filter(Boolean)
        );
        return Array.from(projects).sort();
    }, [timesheets]);

    // FILTER + SEARCH + SORT (all client-side, derived from loaded data)
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

    // SUMMARY STATS (derived from currently loaded data, not the filtered subset)
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

    // EXPORT TO CSV — exports whatever is currently filtered/visible
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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Timesheets
                        </h1>

                        <p className="text-gray-500 mt-1">
                            All approved timesheets across the team
                        </p>

                        {lastUpdated && (
                            <p className="text-xs text-gray-400 mt-1">
                                Last updated{" "}
                                {lastUpdated.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                        {/* SEARCH */}
                        <div className="relative flex-1 sm:w-64">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search employee or project..."
                                className="w-full h-11 pl-11 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                            />
                        </div>

                        <div className="flex gap-3">
                            {/* REFRESH */}
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading || refreshing}
                                className="cursor-pointer h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 flex items-center justify-center gap-2 text-sm font-medium transition-all shrink-0"
                            >
                                <RefreshCcw
                                    size={16}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            {/* EXPORT */}
                            <button
                                type="button"
                                onClick={handleExportCsv}
                                disabled={filteredTimesheets.length === 0}
                                className="cursor-pointer h-11 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 text-sm font-medium transition-all shrink-0"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    <div className="bg-white border border-gray-200 rounded-3xl px-5 py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                            <Clock3 size={18} className="text-blue-600" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">Total Hours</p>
                            <p className="text-lg font-bold text-gray-900 truncate">
                                {totalHours} hrs
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl px-5 py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                            <Users size={18} className="text-green-600" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">Employees</p>
                            <p className="text-lg font-bold text-gray-900 truncate">
                                {uniqueEmployeeCount}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl px-5 py-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                        <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                            <TrendingUp size={18} className="text-amber-600" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">Avg Hours / Entry</p>
                            <p className="text-lg font-bold text-gray-900 truncate">
                                {avgHoursPerEntry} hrs
                            </p>
                        </div>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">

                    {/* DATE RANGE */}
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <CalendarRange size={16} className="text-gray-400 shrink-0" />

                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            {DATE_RANGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PROJECT FILTER */}
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <FolderKanban size={16} className="text-gray-400 shrink-0" />

                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="all">All Projects</option>
                            {projectOptions.map((project) => (
                                <option key={project} value={project}>
                                    {project}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SORT */}
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <ArrowUpDown size={16} className="text-gray-400 shrink-0" />

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="cursor-pointer h-10 px-4 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all shrink-0"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5">

                    {!loading && timesheets.length > 0 && (
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-semibold text-gray-900">
                                    {filteredTimesheets.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-900">
                                    {timesheets.length}
                                </span>{" "}
                                timesheets
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <TimesheetSkeleton />
                    ) : timesheets.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                            <ClipboardList size={32} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-600">
                                No approved timesheets yet
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Approved timesheets will appear here
                            </p>
                        </div>
                    ) : filteredTimesheets.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                            <Search size={32} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-600">
                                No timesheets match your filters
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try adjusting the search, date range, or project filter
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredTimesheets.map((timesheet) => (
                                <TimesheetCard
                                    key={timesheet._id}
                                    timesheet={timesheet}
                                    onView={setViewingTimesheet}
                                />
                            ))}
                        </div>
                    )}

                </div>

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