import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';

import {
    LuFileSpreadsheet,
    LuSearch,
    LuPlus,
    LuLayoutGrid,
    LuListFilter,
    LuRefreshCcw
} from 'react-icons/lu';

import TaskStatusTabs from '../../components/TaskStatusTabs.jsx';
import TaskCard from '../../components/Cards/TaskCard.jsx';

import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div
        className={`bg-gradient-to-r from-slate-100 via-orange-50 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
    />
);

const TaskCardSkeleton = () => (
    <div className='bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4'>
        <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-5 w-20' />
            <SkeletonBlock className='h-5 w-16' />
        </div>

        <SkeletonBlock className='h-6 w-3/4' />

        <div className='space-y-2'>
            <SkeletonBlock className='h-3 w-full' />
            <SkeletonBlock className='h-3 w-5/6' />
        </div>

        <SkeletonBlock className='h-2 w-full rounded-full' />

        <div className='flex items-center justify-between'>
            <div className='flex -space-x-2'>
                {[...Array(3)].map((_, i) => (
                    <SkeletonBlock
                        key={i}
                        className='h-8 w-8 rounded-full border-2 border-white'
                    />
                ))}
            </div>

            <SkeletonBlock className='h-4 w-24' />
        </div>
    </div>
);

const ManageTasksSkeleton = () => (
    <div className='space-y-6 py-4'>
        {/* Top Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className='bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-5 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                >
                    <SkeletonBlock className='h-5 w-16' />
                    <SkeletonBlock className='h-8 w-12' />
                </div>
            ))}
        </div>

        {/* Search */}
        <div className='flex flex-col lg:flex-row gap-3'>
            <SkeletonBlock className='h-12 flex-1 rounded-2xl' />
            <SkeletonBlock className='h-12 w-full lg:w-40 rounded-2xl' />
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
            {[...Array(6)].map((_, i) => (
                <TaskCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const ManageTasks = () => {

    const navigate = useNavigate();

    // STATES
    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);

    const [filterStatus, setFilterStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ─────────────────────────────────────────────────────────
    // FETCH TASKS
    // ─────────────────────────────────────────────────────────

    const getAllTasks = async () => {

        try {

            if (!loading) {
                setRefreshing(true);
            }

            const response = await axiosInstance.get(
                API_PATHS.TASKS.GET_ALL_TASKS,
                {
                    params: {
                        status:
                            filterStatus === "All"
                                ? ""
                                : filterStatus
                    }
                }
            );

            const tasks = response?.data?.tasks || [];

            setAllTasks(tasks);

            const statusSummary =
                response?.data?.statusSummary || {};

            setTabs([
                {
                    label: "All",
                    count: statusSummary.all || 0
                },
                {
                    label: "Pending",
                    count: statusSummary.pendingTasks || 0
                },
                {
                    label: "In Progress",
                    count: statusSummary.inProgressTasks || 0
                },
                {
                    label: "Completed",
                    count: statusSummary.completedTasks || 0
                }
            ]);

        } catch (error) {

            console.error("Error fetching tasks:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to load tasks"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // DOWNLOAD REPORT
    // ─────────────────────────────────────────────────────────

    const handleDownloadReport = async () => {

        try {

            toast.loading("Preparing report...", {
                id: "download-report"
            });

            const response = await axiosInstance.get(
                API_PATHS.REPORTS.EXPORT_TASKS,
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
                "task_details.xlsx"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success("Report downloaded", {
                id: "download-report"
            });

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to download report",
                {
                    id: "download-report"
                }
            );
        }
    };

    // ─────────────────────────────────────────────────────────
    // FILTERED TASKS
    // ─────────────────────────────────────────────────────────

    const filteredTasks = useMemo(() => {

        return allTasks.filter((task) => {

            const search = searchQuery.toLowerCase();

            return (
                task?.title?.toLowerCase().includes(search) ||
                task?.description?.toLowerCase().includes(search)
            );
        });

    }, [allTasks, searchQuery]);

    // ─────────────────────────────────────────────────────────
    // STATS
    // ─────────────────────────────────────────────────────────

    const stats = useMemo(() => {

        return {
            total: tabs?.find(t => t.label === "All")?.count || 0,
            pending: tabs?.find(t => t.label === "Pending")?.count || 0,
            progress: tabs?.find(t => t.label === "In Progress")?.count || 0,
            completed: tabs?.find(t => t.label === "Completed")?.count || 0
        };

    }, [tabs]);

    // ─────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────

    useEffect(() => {
        getAllTasks();
    }, [filterStatus]);

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

            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;

        document.head.appendChild(style);

        return () => document.head.removeChild(style);

    }, []);

    // ─────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────

    return (
        <DashboardLayout activeMenu="Manage Tasks">

            {loading ? (
                <ManageTasksSkeleton />
            ) : (
                <div className='space-y-6'>

                    {/* ───────────────────────────────────── */}
                    {/* Header */}
                    {/* ───────────────────────────────────── */}

                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>

                        <div className='min-w-0'>
                            <h1 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate'>
                                Manage Tasks
                            </h1>

                            <p className='hidden sm:block text-sm text-slate-500 mt-1 font-medium'>
                                Organize, track and manage team productivity.
                            </p>
                        </div>

                        <div className='flex items-center gap-3 flex-shrink-0'>

                            <button
                                onClick={getAllTasks}
                                className='h-10 w-10 sm:w-auto sm:px-4 sm:h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer hover:shadow-md'
                            >
                                <LuRefreshCcw
                                    className={`${refreshing ? "animate-spin text-orange-500" : ""}`}
                                />
                                <span className='hidden sm:inline'>Refresh</span>
                            </button>

                            <button
                                onClick={handleDownloadReport}
                                className='h-10 w-10 sm:w-auto sm:px-5 sm:h-11 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all cursor-pointer hover:shadow-md'
                            >
                                <LuFileSpreadsheet className='text-lg' />
                                <span className='hidden sm:inline'>Export</span>
                            </button>

                            <button
                                onClick={() => navigate("/admin/create-task")}
                                className='h-10 px-4 sm:h-11 sm:px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-white flex items-center gap-2 text-sm font-bold shadow-[0_6px_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 active:scale-95'
                            >
                                <LuPlus className='text-lg stroke-[3]' />
                                <span className='hidden sm:inline'>Create Task</span>
                            </button>

                        </div>

                    </div>

                    {/* ───────────────────────────────────── */}
                    {/* Filters */}
                    {/* ───────────────────────────────────── */}

                    <div className='flex flex-col xl:flex-row xl:items-center gap-4 bg-white/60 backdrop-blur-xl p-3 rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'>

                        {/* Search */}

                        <div className='relative flex-1'>

                            <LuSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 text-lg' />

                            <input
                                type='text'
                                placeholder='Search tasks by title or description...'
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className='w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 text-sm font-medium transition-all shadow-sm'
                            />

                        </div>

                        {/* Tabs */}

                        <div className='overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0'>

                            <div className='min-w-max'>
                                <TaskStatusTabs
                                    tabs={tabs}
                                    activeTab={filterStatus}
                                    setActiveTab={setFilterStatus}
                                />
                            </div>

                        </div>

                    </div>

                    {/* ───────────────────────────────────── */}
                    {/* Empty State */}
                    {/* ───────────────────────────────────── */}

                    {filteredTasks.length === 0 ? (

                        <div className='bg-slate-50/50 border border-dashed border-slate-200 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center mt-6'>

                            <div className='w-24 h-24 rounded-[2rem] bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 shadow-sm'>
                                <LuListFilter className='text-5xl text-orange-500' />
                            </div>

                            <h3 className='text-2xl font-extrabold text-slate-800 tracking-tight'>
                                No Tasks Found
                            </h3>

                            <p className='text-slate-500 max-w-md mt-3 leading-relaxed font-medium'>
                                {searchQuery
                                    ? "No tasks matched your search. Try different keywords."
                                    : filterStatus === "All"
                                        ? "You haven't created any tasks yet. Start by creating your first task."
                                        : `No tasks available in "${filterStatus}" status.`
                                }
                            </p>

                            <button
                                onClick={() => navigate("/admin/create-task")}
                                className='mt-8 h-12 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold flex items-center gap-2 shadow-[0_6px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)] transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95'
                            >
                                <LuPlus className='text-lg stroke-[3]' />
                                Create Task
                            </button>

                        </div>

                    ) : (

                        <>
                            {/* Result Count */}

                            <div className='flex items-center justify-between'>

                                <p className='text-sm text-slate-500 font-medium'>
                                    Showing{" "}
                                    <span className='font-bold text-slate-900'>
                                        {filteredTasks.length}
                                    </span>{" "}
                                    tasks
                                </p>

                            </div>

                            {/* Tasks Grid */}

                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>

                                {filteredTasks.map((item, index) => (

                                    <TaskCard
                                        key={item._id}
                                        title={item.title}
                                        description={item.description}
                                        priority={item.priority}
                                        status={item.status}
                                        progress={item.progress}
                                        createdAt={item.createdAt}
                                        dueDate={item.dueDate}
                                        assignedTo={item.assignedTo?.map((member) => ({
                                            image:
                                                member.profileImageUrl || null,
                                            name:
                                                member.name || ""
                                        }))}
                                        attachmentCount={
                                            item.attachments?.length || 0
                                        }
                                        completedTodoCount={
                                            item.completedTodoCount || 0
                                        }
                                        todoChecklist={
                                            item.todoChecklist || []
                                        }
                                        index={index}
                                        onClick={() =>
                                            navigate(
                                                `/admin/create-task`,
                                                {
                                                    state: {
                                                        taskId: item._id
                                                    }
                                                }
                                            )
                                        }
                                    />

                                ))}

                            </div>
                        </>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageTasks;