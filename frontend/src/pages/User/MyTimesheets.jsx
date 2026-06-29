import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import {
    ClipboardList,
    Clock3,
    Search,
    RefreshCcw,
    Users,
    TrendingUp,
} from "lucide-react";

import TimesheetCard from "../../components/timesheet/TimesheetCard.jsx";
import TimesheetDetailsModal from "../../components/timesheet/TimesheetDetailsModal.jsx";
import TimesheetSkeleton from "../../components/timesheet/TimesheetSkeleton.jsx";

import { getMyTimesheets } from "../../utils/timesheetService.js";

const MyTimesheets = () => {

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [timesheets, setTimesheets] = useState([]);
    const [search, setSearch] = useState("");

    const [viewingTimesheet, setViewingTimesheet] = useState(null);

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetchData({ isRefresh: true });
    };

    // CLIENT-SIDE SEARCH — filters across employee name, email, and project
    const filteredTimesheets = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return timesheets;

        return timesheets.filter((t) => {
            const employeeName =
                t.employeeName || t.employee?.name || "";
            const employeeEmail =
                t.employeeEmail || t.employee?.email || "";
            const project = t.project || "";

            return (
                employeeName.toLowerCase().includes(query) ||
                employeeEmail.toLowerCase().includes(query) ||
                project.toLowerCase().includes(query)
            );
        });
    }, [timesheets, search]);

    // SUMMARY STATS (derived from currently loaded data)
    const totalHours = useMemo(
        () =>
            timesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0),
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
                            Refresh
                        </button>
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
                                No timesheets match "{search}"
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try a different employee name or project
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