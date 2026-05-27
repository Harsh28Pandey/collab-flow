import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Model from '../../components/Model.jsx';

import {
    LuFileSpreadsheet,
    LuUsers,
    LuRefreshCcw
} from 'react-icons/lu';

import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
    />
);

const UserCardSkeleton = () => (
    <div className='bg-white border border-gray-200 rounded-3xl p-5 shadow-sm'>

        <div className='flex items-center gap-4'>

            <SkeletonBlock className='w-16 h-16 rounded-full' />

            <div className='flex-1 space-y-3'>
                <SkeletonBlock className='h-4 w-32' />
                <SkeletonBlock className='h-3 w-24' />
            </div>

        </div>

        <div className='mt-5 space-y-3'>
            <SkeletonBlock className='h-3 w-full' />
            <SkeletonBlock className='h-3 w-5/6' />
        </div>

    </div>
);

const ManageUsersSkeleton = () => (
    <div className='mt-5 mb-10 space-y-6'>

        {/* Header */}

        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>

            <div className='space-y-2'>
                <SkeletonBlock className='h-7 w-40' />
                <SkeletonBlock className='h-4 w-60' />
            </div>

            <SkeletonBlock className='h-12 w-full sm:w-44 rounded-2xl' />

        </div>

        {/* Cards */}

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>

            {[...Array(6)].map((_, index) => (
                <UserCardSkeleton key={index} />
            ))}

        </div>

    </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const ManageUsers = () => {

    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [openUserModal, setOpenUserModal] = useState(false);

    const handleOpenUser = (user) => {
        setSelectedUser(user);
        setOpenUserModal(true);
    }

    const handleRemoveUser = async (userId) => {

        try {

            await axiosInstance.delete(
                API_PATHS.USERS.DELETE_USER(userId)
            );

            toast.success("User removed successfully");

            setOpenUserModal(false);

            getAllUsers();

        } catch (error) {

            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to remove user"
            );
        }
    }

    // ─────────────────────────────────────────────────────────
    // GET USERS
    // ─────────────────────────────────────────────────────────

    const getAllUsers = async () => {

        try {

            if (!loading) {
                setRefreshing(true);
            }

            const response = await axiosInstance.get(
                API_PATHS.USERS.GET_ALL_USERS
            );

            if (response.data?.length > 0) {
                setAllUsers(response.data);
            } else {
                setAllUsers([]);
            }

        } catch (error) {

            console.error("Error fetching users: ", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch users"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    }

    // ─────────────────────────────────────────────────────────
    // DOWNLOAD REPORT
    // ─────────────────────────────────────────────────────────

    const handleDownloadReport = async () => {

        try {

            toast.loading("Preparing report...", {
                id: "download-users-report"
            });

            const response = await axiosInstance.get(
                API_PATHS.REPORTS.EXPORT_USERS,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                "user_details.xlsx"
            );

            document.body.appendChild(link);

            link.click();

            link.parentNode.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success("Report downloaded successfully", {
                id: "download-users-report"
            });

        } catch (error) {

            console.error("Error downloading users report: ", error);

            toast.error(
                "Failed to download users report",
                {
                    id: "download-users-report"
                }
            );
        }
    }

    // ─────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────

    useEffect(() => {

        getAllUsers();

        return () => { }

    }, []);

    // shimmer animation
    useEffect(() => {

        const style = document.createElement('style');

        style.innerHTML = `
            @keyframes shimmer {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }

            .animate-shimmer {
                animation: shimmer 1.5s infinite linear;
            }
        `;

        document.head.appendChild(style);

        return () => document.head.removeChild(style);

    }, []);

    // ─────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────

    return (
        <DashboardLayout activeMenu="Team Members">

            {loading ? (

                <ManageUsersSkeleton />

            ) : (

                <div className='mt-5 mb-10'>

                    {/* Header */}

                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6'>

                        <div>

                            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                                Team Members
                            </h1>

                            <p className='text-sm text-gray-600 mt-1'>
                                Manage and monitor all your workspace members.
                            </p>

                        </div>

                        <div className='flex flex-wrap items-center gap-3'>

                            {/* Refresh */}

                            <button
                                onClick={getAllUsers}
                                className='h-11 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2 text-sm font-medium transition-all cursor-pointer'
                            >
                                <LuRefreshCcw
                                    className={`${refreshing ? "animate-spin" : ""}`}
                                />

                                Refresh
                            </button>

                            {/* Download */}

                            <button
                                className='h-11 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer'
                                onClick={handleDownloadReport}
                            >
                                <LuFileSpreadsheet className='text-lg' />
                                Download Report
                            </button>

                        </div>

                    </div>

                    {/* Empty State */}

                    {allUsers.length === 0 ? (

                        <div className='bg-white border border-dashed border-gray-300 rounded-[30px] py-20 px-6 flex flex-col items-center justify-center text-center shadow-sm'>

                            <div className='w-24 h-24 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6'>

                                <LuUsers className='text-5xl text-blue-500' />

                            </div>

                            <h3 className='text-2xl font-bold text-gray-800'>
                                No Team Members Found
                            </h3>

                            <p className='text-gray-600 max-w-md mt-3 leading-relaxed'>
                                There are currently no users in your workspace.
                                Add team members to start collaboration.
                            </p>

                        </div>

                    ) : (

                        <>
                            {/* Count */}

                            <div className='flex items-center justify-between mb-4'>

                                <p className='text-sm text-gray-600'>
                                    Total Members :{" "}
                                    <span className='font-semibold text-gray-900'>
                                        {allUsers.length}
                                    </span>
                                </p>

                            </div>

                            {/* Users Grid */}

                            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>

                                {allUsers?.map((user) => {

                                    // Normalize backend data (VERY IMPORTANT)
                                    const safeUser = {
                                        ...user,
                                        pendingTasks: user?.pendingTasks ?? 0,
                                        inProgressTasks: user?.inProgressTasks ?? 0,
                                        completedTasks: user?.completedTasks ?? 0,
                                    };

                                    return (
                                        <div
                                            key={safeUser._id}
                                            className='transition-all duration-300 hover:-translate-y-1'
                                        >
                                            <div
                                                onClick={() => handleOpenUser(safeUser)}
                                                className='cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                                            >
                                                <UserCard userInfo={safeUser} />
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </>
                    )}

                </div>
            )}

            {/* USER DETAILS MODAL */}

            <Model
                isOpen={openUserModal}
                onClose={() => setOpenUserModal(false)}
                title="Member Details"
            >
                {selectedUser && (
                    <div className="space-y-6">

                        {/* PROFILE SECTION */}
                        <div className="flex flex-col items-center text-center">

                            {/* Avatar / Fallback */}
                            {selectedUser?.profileImageUrl ? (
                                <img
                                    src={selectedUser.profileImageUrl}
                                    alt="profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-sm"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-600 text-white text-3xl font-bold border-4 border-blue-100 shadow-sm">
                                    {selectedUser?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-gray-900 mt-4">
                                {selectedUser?.name}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                {selectedUser?.email}
                            </p>

                            <span className="mt-3 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                {selectedUser?.role || "Member"}
                            </span>
                        </div>

                        {/* TASK STATS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* PENDING */}
                            <div className="relative overflow-hidden rounded-3xl p-5 text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:scale-[1.02] transition">

                                <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>

                                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                                    Pending
                                </p>

                                <h4 className="text-4xl font-extrabold mt-2">
                                    {selectedUser?.pendingTasks || 0}
                                </h4>

                            </div>

                            {/* IN PROGRESS */}
                            <div className="relative overflow-hidden rounded-3xl p-5 text-center bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg hover:scale-[1.02] transition">

                                <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>

                                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                                    In Progress
                                </p>

                                <h4 className="text-4xl font-extrabold mt-2">
                                    {selectedUser?.inProgressTasks || 0}
                                </h4>

                            </div>

                            {/* COMPLETED */}
                            <div className="relative overflow-hidden rounded-3xl p-5 text-center bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg hover:scale-[1.02] transition">

                                <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>

                                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                                    Completed
                                </p>

                                <h4 className="text-4xl font-extrabold mt-2">
                                    {selectedUser?.completedTasks || 0}
                                </h4>

                            </div>

                        </div>

                        {/* JOINED DATE */}
                        <div className="bg-gray-50 border rounded-2xl p-4">
                            <p className="text-sm text-gray-600">Joined Date</p>
                            <h4 className="font-semibold text-gray-800 mt-1">
                                {selectedUser?.createdAt
                                    ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : "N/A"}
                            </h4>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-3">

                            <button
                                onClick={() => handleRemoveUser(selectedUser._id)}
                                className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer"
                            >
                                Remove User
                            </button>

                            <button
                                onClick={() => setOpenUserModal(false)}
                                className="w-full h-12 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition cursor-pointer"
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                )}
            </Model>


        </DashboardLayout>
    )
}

export default ManageUsers