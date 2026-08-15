// src/pages/Timesheet.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { Plus, Users, Clock3, ClipboardList, CheckCircle, Download } from "lucide-react";

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

const escapeCsvValue = (value) => {
    const str = String(value ?? "");

    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
};

const Timesheet = () => {

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    const [search, setSearch] = useState("");

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

    // CONFIRM APPROVE / REJECT (reason is required, enforced inside the modal)
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

    // EXPORT TO CSV — exports whatever timesheets are currently loaded
    const handleExportReport = () => {
        if (timesheets.length === 0) return;

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

        const rows = timesheets.map((t) => [
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

                        {/* Description visible in both mobile and desktop */}
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                            Manage employee work logs and approvals.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">

                        {/* Search Bar - Note: Assuming SearchBar has been styled internally, if not you can wrap or pass custom class to it */}
                        <div className="flex-1 min-w-0">
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            // You might need to update SearchBar component's internal style to match dark mode, 
                            // otherwise it will use default style.
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Export Button */}
                            <button
                                onClick={handleExportReport}
                                disabled={timesheets.length === 0}
                                className="flex-1 sm:flex-none h-11 px-4 sm:px-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-inner transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Download size={16} className="stroke-[2.5]" />
                                <span className="hidden sm:inline">Export</span>
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

                    {/* Wrapping SummaryCards in Glassy Container if their internal style isn't modified */}
                    <SummaryCard
                        title="Employees"
                        value={allUsers.length}
                        icon={<Users className="text-cyan-400" size={18} />}
                    // Tip: Update internal SummaryCard CSS to fit dark bento style, or pass classes if allowed.
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

                {/* ───────────────── BODY LIST ───────────────── */}
                <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                    {loading ? (
                        <TimesheetSkeleton />
                    ) : timesheets.length === 0 ? (
                        <div className="border border-dashed border-white/10 rounded-[2rem] py-20 px-6 flex flex-col items-center justify-center text-center">
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
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {timesheets.map((timesheet) => (
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

                </div>

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