import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Model from '../../components/Model.jsx';

import {
    LuFileSpreadsheet,
    LuUsers,
    LuRefreshCcw,
    LuSearch,
} from 'react-icons/lu';

import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Skeleton Components (Dark Mode Cyber Pulse)
// ─────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`}
    />
);

const UserCardSkeleton = () => (
    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4'>

        <div className='flex items-center gap-4'>

            <SkeletonBlock className='w-16 h-16 rounded-full' />

            <div className='flex-1 space-y-3'>
                <SkeletonBlock className='h-4 w-32 rounded-lg' />
                <SkeletonBlock className='h-3 w-24 rounded-lg' />
            </div>

        </div>

        <div className='mt-5 space-y-3'>
            <SkeletonBlock className='h-3 w-full rounded-md' />
            <SkeletonBlock className='h-3 w-5/6 rounded-md' />
        </div>

    </div>
);

const ManageUsersSkeleton = () => (
    <div className='mt-5 mb-10 space-y-6'>

        {/* Header */}

        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>

            <div className='space-y-2'>
                <SkeletonBlock className='h-7 w-40 rounded-lg' />
                <SkeletonBlock className='h-4 w-60 rounded-lg' />
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

    const [search, setSearch] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [openUserModal, setOpenUserModal] = useState(false);

    // SEARCH — filter by name or email (client-side, no extra API call)
    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return allUsers;
        return allUsers.filter(
            (user) =>
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
        );
    }, [allUsers, search]);

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

                            <h1 className='text-2xl md:text-3xl font-black text-white tracking-tight'>
                                Team Members
                            </h1>

                            <p className='text-xs sm:text-sm text-zinc-400 mt-1 font-mono'>
                                Manage and monitor all your workspace members.
                            </p>

                        </div>

                        <div className='flex flex-wrap items-center gap-3'>

                            {/* Refresh */}

                            <button
                                onClick={getAllUsers}
                                className='h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold shadow-inner transition-all cursor-pointer'
                            >
                                <LuRefreshCcw
                                    className={`${refreshing ? "animate-spin text-cyan-400" : ""}`}
                                />

                                Refresh
                            </button>

                            {/* Download */}

                            <button
                                className='h-11 px-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-xs sm:text-sm font-mono font-bold shadow-inner transition-all cursor-pointer'
                                onClick={handleDownloadReport}
                            >
                                <LuFileSpreadsheet className='text-base' />
                                Download Report
                            </button>

                        </div>

                    </div>

                    {/* SEARCH */}
                    <div className='relative mb-5 max-w-xl'>
                        <LuSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-base z-10 pointer-events-none' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search by name or email...'
                            className='w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner'
                        />
                    </div>

                    {/* Empty State */}

                    {allUsers.length === 0 ? (

                        <div className='bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl'>

                            <div className='w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]'>

                                <LuUsers className='text-3xl text-cyan-400' />

                            </div>

                            <h3 className='text-xl md:text-2xl font-black text-white tracking-tight'>
                                No Team Members Found
                            </h3>

                            <p className='text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm'>
                                There are currently no users in your workspace.
                                Add team members to start collaboration.
                            </p>

                        </div>

                    ) : filteredUsers.length === 0 ? (

                        <div className='bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-16 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl'>

                            <div className='w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4'>
                                <LuSearch className='text-2xl text-zinc-400' />
                            </div>

                            <h3 className='text-base sm:text-lg font-mono font-bold text-white'>
                                No results for "{search}"
                            </h3>

                            <p className='text-zinc-400 text-xs sm:text-sm font-mono mt-1'>
                                Try a different name or email address.
                            </p>

                        </div>

                    ) : (

                        <>
                            {/* Count */}

                            <div className='flex items-center justify-between mb-4 px-1'>

                                <p className='text-xs font-mono text-zinc-400'>
                                    {search.trim() ? (
                                        <>
                                            Showing{" "}
                                            <span className='font-bold text-cyan-400'>
                                                {filteredUsers.length}
                                            </span>
                                            {" "}of{" "}
                                            <span className='font-bold text-white'>
                                                {allUsers.length}
                                            </span>
                                            {" "}members
                                        </>
                                    ) : (
                                        <>
                                            Total Members :{" "}
                                            <span className='font-bold text-cyan-400'>
                                                {allUsers.length}
                                            </span>
                                        </>
                                    )}
                                </p>

                            </div>

                            {/* Users Grid */}

                            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>

                                {filteredUsers?.map((user) => {

                                    const safeUser = {
                                        ...user,
                                        pendingTasks: user?.pendingTasks ?? 0,
                                        inProgressTasks: user?.inProgressTasks ?? 0,
                                        completedTasks: user?.completedTasks ?? 0,
                                    };

                                    return (
                                        <div
                                            key={safeUser._id}
                                            className='transition-all duration-300 hover:-translate-y-1 cursor-pointer'
                                            onClick={() => handleOpenUser(safeUser)}
                                        >
                                            <UserCard userInfo={safeUser} />
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
                                    className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500/30 shadow-2xl"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white text-3xl font-mono font-black border-2 border-cyan-500/30 shadow-2xl uppercase">
                                    {selectedUser?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                            )}

                            <h3 className="text-xl font-mono font-black text-white tracking-tight mt-4">
                                {selectedUser?.name}
                            </h3>

                            <p className="text-xs font-mono text-zinc-400 mt-1">
                                {selectedUser?.email}
                            </p>

                            <span className="mt-3 px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold shadow-inner">
                                {selectedUser?.role || "Member"}
                            </span>
                        </div>

                        {/* TASK STATS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* PENDING */}
                            <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-zinc-900/80 border border-white/5 shadow-inner">
                                <p className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                                    Pending
                                </p>
                                <h4 className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                                    {selectedUser?.pendingTasks || 0}
                                </h4>
                            </div>

                            {/* IN PROGRESS */}
                            <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-zinc-900/80 border border-white/5 shadow-inner">
                                <p className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                                    In Progress
                                </p>
                                <h4 className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                                    {selectedUser?.inProgressTasks || 0}
                                </h4>
                            </div>

                            {/* COMPLETED */}
                            <div className="relative overflow-hidden rounded-2xl p-4 text-center bg-zinc-900/80 border border-white/5 shadow-inner">
                                <p className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                    Completed
                                </p>
                                <h4 className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                                    {selectedUser?.completedTasks || 0}
                                </h4>
                            </div>

                        </div>

                        {/* JOINED DATE */}
                        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 shadow-inner">
                            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Joined Date</p>
                            <h4 className="font-mono font-bold text-white text-sm mt-1">
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
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">

                            <button
                                onClick={() => handleRemoveUser(selectedUser._id)}
                                className="w-full h-12 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-inner"
                            >
                                Remove User
                            </button>

                            <button
                                onClick={() => setOpenUserModal(false)}
                                className="w-full h-12 rounded-2xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-inner"
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

export default ManageUsers;