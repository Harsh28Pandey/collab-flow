import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import {
    Plus,
    Users,
    Clock3,
    ClipboardList,
    CheckCircle,
    Download,
    ArrowUpDown,
    CalendarRange,
    FolderKanban,
    Search
} from "lucide-react";

import SearchBar from "../../components/timesheet/SearchBar.jsx";
import SummaryCard from "../../components/timesheet/SummaryCard.jsx";
import TimesheetSkeleton from "../../components/timesheet/TimesheetSkeleton.jsx";
import Timesheetcard from "../../components/timesheet/Timesheetcard.jsx";
import Approverejectmodal from "../../components/timesheet/Approverejectmodal.jsx";
import Timesheetdetailsmodal from "../../components/timesheet/Timesheetdetailsmodal.jsx";

import {
    getTimesheets,
    getTimesheetStats,
    approveTimesheet,
    rejectTimesheet,
} from "../../utils/timesheetService.js";

import CreateTimesheetModal from "../../components/timesheet/CreateTimesheetModal.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

// ─────────────────────────────────────────────
// Constants for Filters
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const Timesheet = () => {

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    const [search, setSearch] = useState("");

    // FILTER STATES
    const [dateRange, setDateRange] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date_desc");

    const [stats, setStats] = useState({});

    const [timesheets, setTimesheets] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);

    // DETAILS MODAL
    const [viewingTimesheet, setViewingTimesheet] = useState(null);

    // APPROVE / REJECT MODAL
    const [actionModal, setActionModal] = useState({
        open: false,
        mode: null, // "approve" | "reject"
        timesheet: null,
    });

    const fetchData = async () => {
        try {
            setLoading(true);

            const [statsRes, listRes, usersRes] = await Promise.all([
                getTimesheetStats(),
                getTimesheets({ search }),
                axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS),
            ]);

            setStats(statsRes.data?.data || {});
            setTimesheets(listRes.data?.data || []);
            setAllUsers(usersRes.data || []);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // UNIQUE PROJECT LIST (for the filter dropdown)
    const projectOptions = useMemo(() => {
        const projects = new Set(
            timesheets.map((t) => t.project).filter(Boolean)
        );
        return Array.from(projects).sort();
    }, [timesheets]);

    // FILTER + SORT LOGIC
    const filteredTimesheets = useMemo(() => {
        let result = timesheets.filter((t) => {
            const matchesDateRange = isInDateRange(t.date, dateRange);
            const matchesProject = projectFilter === "all" || t.project === projectFilter;
            return matchesDateRange && matchesProject;
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
    }, [timesheets, dateRange, projectFilter, sortBy]);

    const hasActiveFilters = dateRange !== "all" || projectFilter !== "all" || sortBy !== "date_desc";

    const resetFilters = () => {
        setDateRange("all");
        setProjectFilter("all");
        setSortBy("date_desc");
    };

    // OPEN APPROVE / REJECT MODAL
    const handleApproveClick = (timesheet) => {
        setActionModal({ open: true, mode: "approve", timesheet });
    };

    const handleRejectClick = (timesheet) => {
        setActionModal({ open: true, mode: "reject", timesheet });
    };

    const closeActionModal = () => {
        setActionModal({ open: false, mode: null, timesheet: null });
    };

    // CONFIRM APPROVE / REJECT
    const handleConfirmAction = async (reason) => {
        const { mode, timesheet } = actionModal;

        if (mode === "approve") {
            await approveTimesheet(timesheet._id, { adminRemark: reason });
        } else {
            await rejectTimesheet(timesheet._id, { rejectReason: reason });
        }

        closeActionModal();

        // Refresh list + stats so counts update dynamically
        await fetchData();
    };

    // EXPORT TO CSV
    const handleExportReport = () => {
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
            "Status",
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
            t.status || "",
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

    return (
        <DashboardLayout activeMenu="Timesheet">

            <div className="space-y-6">

                {/* ───────────────── HEADER ───────────────── */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                            Timesheets
                        </h1>

                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                            Manage employee work logs and approvals.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">

                        <div className="flex-1 min-w-0">
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Export Button */}
                            <button
                                onClick={handleExportReport}
                                disabled={filteredTimesheets.length === 0}
                                className="flex-1 sm:flex-none h-11 px-4 sm:px-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-inner transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Download size={16} className="stroke-[2.5]" />
                                <span>Export</span>
                            </button>

                            {/* Create Button */}
                            <div className="relative group cursor-pointer flex-1 sm:flex-none">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    onClick={() => setOpenCreate(true)}
                                    className="relative w-full sm:w-auto h-11 px-4 sm:px-6 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all cursor-pointer active:scale-95 shadow-lg text-nowrap"
                                >
                                    <Plus size={16} className="text-cyan-400 stroke-[3]" />
                                    <span>Create <span className="hidden sm:inline">Timesheet</span></span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ───────────────── SUMMARY CARDS ───────────────── */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">

                    <SummaryCard
                        title="Employees"
                        value={allUsers.length}
                        icon={<Users className="text-cyan-400" size={18} />}
                    />

                    <SummaryCard
                        title="Total Hours"
                        value={stats.totalHours || 0}
                        icon={<Clock3 className="text-purple-400" size={18} />}
                    />

                    <SummaryCard
                        title="Pending"
                        value={stats.pending || 0}
                        icon={<ClipboardList className="text-amber-400" size={18} />}
                    />

                    <SummaryCard
                        title="Approved"
                        value={stats.approved || 0}
                        icon={<CheckCircle className="text-emerald-400" size={18} />}
                    />

                </div>

                {/* ───────────────── FILTER BAR ───────────────── */}
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

                {/* ───────────────── BODY LIST ───────────────── */}

                {!loading && timesheets.length > 0 && (
                    <div className="flex items-center justify-between px-1 mt-2">
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
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                            <ClipboardList size={28} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                            No Timesheets Found
                        </h3>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-2">
                            Create a new timesheet to get started tracking work logs.
                        </p>
                    </div>
                ) : filteredTimesheets.length === 0 ? (
                    <div className="bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                            <Search size={28} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                            No timesheets match your filters
                        </h3>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-2">
                            Try adjusting the search, date range, or project filter to see results.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
                        {filteredTimesheets.map((timesheet) => (
                            <Timesheetcard
                                key={timesheet._id}
                                timesheet={timesheet}
                                onView={setViewingTimesheet}
                                onApprove={handleApproveClick}
                                onReject={handleRejectClick}
                            />
                        ))}
                    </div>
                )}

                {/* ───────────────── MODALS ───────────────── */}
                <CreateTimesheetModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSuccess={fetchData}
                />

                <Timesheetdetailsmodal
                    open={!!viewingTimesheet}
                    timesheet={viewingTimesheet}
                    onClose={() => setViewingTimesheet(null)}
                />

                <Approverejectmodal
                    open={actionModal.open}
                    mode={actionModal.mode}
                    onClose={closeActionModal}
                    onConfirm={handleConfirmAction}
                />

            </div>

        </DashboardLayout>
    );
};

export default Timesheet;