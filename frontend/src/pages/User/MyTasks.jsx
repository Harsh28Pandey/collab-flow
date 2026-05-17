import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import {
    LuSearch,
    LuListFilter,
    LuRefreshCcw
} from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs.jsx';
import TaskCard from '../../components/Cards/TaskCard.jsx';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`} />
);

const TaskCardSkeleton = () => (
    <div className='bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4'>
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
                    <SkeletonBlock key={i} className='h-8 w-8 rounded-full border-2 border-white' />
                ))}
            </div>
            <SkeletonBlock className='h-4 w-24' />
        </div>
    </div>
);

const MyTasksSkeleton = () => (
    <div className='space-y-6 py-4'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
            <div className='space-y-2'>
                <SkeletonBlock className='h-8 w-36' />
                <SkeletonBlock className='h-4 w-56' />
            </div>
            <SkeletonBlock className='h-11 w-28 rounded-2xl' />
        </div>

        {/* Search + Tabs */}
        <div className='flex flex-col xl:flex-row xl:items-center gap-4'>
            <SkeletonBlock className='h-12 flex-1 rounded-2xl' />
            <SkeletonBlock className='h-10 w-72 rounded-full' />
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
            {[...Array(6)].map((_, i) => (
                <TaskCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MyTasks = () => {

    const navigate = useNavigate();

    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const getAllTasks = async () => {
        try {
            if (!loading) setRefreshing(true);

            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                params: {
                    status: filterStatus === "All" ? "" : filterStatus
                }
            });

            const tasks = response?.data?.tasks || [];
            setAllTasks(tasks);

            const statusSummary = response?.data?.statusSummary || {};
            setTabs([
                { label: "All", count: statusSummary.all || 0 },
                { label: "Pending", count: statusSummary.pendingTasks || 0 },
                { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
                { label: "Completed", count: statusSummary.completedTasks || 0 }
            ]);

        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ✅ Frontend search — title ya description se
    const filteredTasks = useMemo(() => {
        return allTasks.filter((task) => {
            const search = searchQuery.toLowerCase();
            return (
                task?.title?.toLowerCase().includes(search) ||
                task?.description?.toLowerCase().includes(search)
            );
        });
    }, [allTasks, searchQuery]);

    useEffect(() => {
        getAllTasks();
        return () => { };
    }, [filterStatus]);

    // ✅ Shimmer animation inject
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .animate-shimmer {
                animation: shimmer 1.5s infinite linear;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <DashboardLayout activeMenu="My Tasks">

            {loading ? (
                <MyTasksSkeleton />
            ) : (
                <div className='py-4 md:py-5 space-y-6'>

                    {/* ── Header ── */}
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                                My Tasks
                            </h1>
                            <p className='text-sm text-gray-500 mt-1'>
                                View and track all your assigned tasks in one place.
                            </p>
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={getAllTasks}
                            className='h-11 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all cursor-pointer self-start lg:self-auto'
                        >
                            <LuRefreshCcw className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>

                    {/* ── Search + Tabs ── */}
                    <div className='flex flex-col sm:flex-row sm:items-center gap-4'>

                        {/* Search */}
                        <div className='relative flex-1'>
                            <LuSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg' />
                            <input
                                type='text'
                                placeholder='Search tasks by title or description...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all'
                            />
                        </div>

                        {/* Tabs */}
                        <div className='overflow-x-auto scrollbar-hide'>
                            <div className='min-w-max'>
                                <TaskStatusTabs
                                    tabs={tabs}
                                    activeTab={filterStatus}
                                    setActiveTab={setFilterStatus}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Empty State ── */}
                    {filteredTasks.length === 0 ? (
                        <div className='bg-white border border-dashed border-gray-200 rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center'>
                            <div className='w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mb-6'>
                                <LuListFilter className='text-5xl text-blue-500' />
                            </div>
                            <h3 className='text-2xl font-bold text-gray-800'>
                                {searchQuery
                                    ? "No Tasks Found 🔍"
                                    : filterStatus === "All"
                                        ? "No Tasks Assigned Yet 📋"
                                        : `No ${filterStatus} Tasks 📋`
                                }
                            </h3>
                            <p className='text-gray-500 max-w-md mt-3 leading-relaxed'>
                                {searchQuery
                                    ? `No tasks matched "${searchQuery}". Try different keywords.`
                                    : filterStatus === "All"
                                        ? "You don't have any tasks assigned yet. Your admin will assign tasks to you soon."
                                        : `You don't have any tasks with "${filterStatus}" status. Try switching to a different filter.`
                                }
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className='mt-6 h-11 px-6 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer'
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Result count */}
                            <div className='flex items-center justify-between'>
                                <p className='text-sm text-gray-500'>
                                    Showing{" "}
                                    <span className='font-semibold text-gray-900'>
                                        {filteredTasks.length}
                                    </span>{" "}
                                    task{filteredTasks.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {/* ── Task Cards Grid ── */}
                            <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5'>
                                {filteredTasks.map((item) => (
                                    <TaskCard
                                        key={item._id}
                                        title={item.title}
                                        description={item.description}
                                        priority={item.priority}
                                        status={item.status}
                                        progress={item.progress}
                                        createdAt={item.createdAt}
                                        dueDate={item.dueDate}
                                        assignedTo={item.assignedTo?.map((u) => ({
                                            image: u.profileImageUrl || null,
                                            name: u.name || ""
                                        }))}
                                        attachmentCount={item.attachments?.length || 0}
                                        completedTodoCount={item.completedTodoCount || 0}
                                        todoChecklist={item.todoChecklist || []}
                                        onClick={() => navigate(`/user/task-details/${item._id}`)}
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

export default MyTasks;