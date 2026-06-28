import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { Plus, Users, Clock3, ClipboardList, CheckCircle } from "lucide-react";

import SearchBar from "../../components/timesheet/SearchBar.jsx";
import SummaryCard from "../../components/timesheet/SummaryCard.jsx";
import TimesheetSkeleton from "../../components/timesheet/TimesheetSkeleton.jsx";
import TimesheetCard from "../../components/timesheet/Timesheetcard.jsx";
import ApproveRejectModal from "../../components/timesheet/ApproveRejectModal.jsx";
import TimesheetDetailsModal from "../../components/timesheet/TimesheetDetailsModal.jsx";

import {
    getTimesheets,
    getTimesheetStats,
    approveTimesheet,
    rejectTimesheet,
} from "../../utils/timesheetService.js";

import CreateTimesheetModal from "../../components/timesheet/CreateTimesheetModal.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

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

    // const getAllUsers = async () => {
    //     try {
    //         const response = await axiosInstance.get(
    //             API_PATHS.USERS.GET_ALL_USERS
    //         );

    //         if (response.data?.length > 0) {
    //             setAllUsers(response.data);
    //         } else {
    //             setAllUsers([]);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         setAllUsers([]);
    //     }
    // };

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
        // getAllUsers();
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

    return (
        <DashboardLayout activeMenu="Timesheet">

            <div className="space-y-6">

                {/* Header */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Timesheets
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage employee work logs and approvals
                        </p>

                    </div>

                    <div className="flex flex-col md:flex-row gap-3">

                        <SearchBar
                            value={search}
                            onChange={setSearch}
                        />

                        <button
                            onClick={() => setOpenCreate(true)}
                            className="bg-blue-600 hover:bg-blue-700 cursor-pointer transition-all text-white rounded-2xl px-5 py-3 flex items-center justify-center gap-2 shadow-md"
                        >
                            <Plus size={18} />
                            Create Timesheet
                        </button>

                    </div>

                </div>

                {/* Summary Cards */}

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">

                    <SummaryCard
                        title="Employees"
                        value={allUsers.length}
                        icon={<Users />}
                    />

                    <SummaryCard
                        title="Hours"
                        value={stats.totalHours || 0}
                        icon={<Clock3 />}
                    />

                    <SummaryCard
                        title="Pending"
                        value={stats.pending || 0}
                        icon={<ClipboardList />}
                    />

                    <SummaryCard
                        title="Approved"
                        value={stats.approved || 0}
                        icon={<CheckCircle />}
                    />

                </div>

                {/* Body */}

                <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5">

                    {loading ? (
                        <TimesheetSkeleton />
                    ) : timesheets.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-3xl py-16 text-center">
                            <ClipboardList size={32} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-600">
                                No timesheets found
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Create a new timesheet to get started
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {timesheets.map((timesheet) => (
                                <TimesheetCard
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

                <CreateTimesheetModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSuccess={fetchData}
                />

                <TimesheetDetailsModal
                    open={!!viewingTimesheet}
                    timesheet={viewingTimesheet}
                    onClose={() => setViewingTimesheet(null)}
                />

                <ApproveRejectModal
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