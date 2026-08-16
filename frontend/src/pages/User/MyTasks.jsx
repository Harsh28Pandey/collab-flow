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
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const TaskCardSkeleton = () => (
    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] space-y-5'>
        <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-6 w-24 rounded-lg' />
            <SkeletonBlock className='h-6 w-20 rounded-full' />
        </div>
        <SkeletonBlock className='h-7 w-3/4 rounded-xl' />
        <div className='space-y-3'>
            <SkeletonBlock className='h-3 w-full rounded-md' />
            <SkeletonBlock className='h-3 w-5/6 rounded-md' />
        </div>
        <SkeletonBlock className='h-2.5 w-full rounded-full' />
        <div className='flex items-center justify-between pt-4 border-t border-white/5'>
            <div className='flex -space-x-2'>
                {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} className='h-10 w-10 rounded-full border-2 border-zinc-950' />
                ))}
            </div>
            <SkeletonBlock className='h-5 w-28 rounded-lg' />
        </div>
    </div>
);

const MyTasksSkeleton = () => (
    <div className='space-y-6 py-4'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
            <div className='space-y-2'>
                <SkeletonBlock className='h-8 w-40 rounded-xl' />
                <SkeletonBlock className='h-4 w-64 rounded-md' />
            </div>
            <SkeletonBlock className='h-11 w-32 rounded-2xl' />
        </div>

        {/* Search + Tabs */}
        <div className='flex flex-col xl:flex-row xl:items-center gap-4'>
            <SkeletonBlock className='h-12 flex-1 max-w-xl rounded-2xl' />
            <SkeletonBlock className='h-12 w-80 rounded-full' />
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6'>
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
                animation: shimmer 2s infinite linear;
            }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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
                            <h1 className='text-2xl sm:text-3xl font-black text-white tracking-tight'>
                                My Tasks
                            </h1>
                            <p className='text-xs sm:text-sm font-mono text-zinc-400 mt-1'>
                                View and track all your assigned tasks in one place.
                            </p>
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={getAllTasks}
                            disabled={refreshing}
                            className='h-11 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white flex items-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-inner cursor-pointer self-start lg:self-auto active:scale-95'
                        >
                            <LuRefreshCcw className={`${refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} stroke-[2.5]`} size={16} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    {/* ── Search + Tabs ── */}
                    <div className='flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between'>

                        {/* Search */}
                        <div className='relative flex-1 max-w-xl shrink-0'>
                            <LuSearch size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10 pointer-events-none' />
                            <input
                                type='text'
                                placeholder='Search tasks by title or description...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner'
                            />
                        </div>

                        {/* Tabs */}
                        <div className='overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0 pb-1 sm:pb-0'>
                            <div className='min-w-max flex items-center h-12'>
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
                        <div className='bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl mt-6'>
                            <div className='w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(56,189,248,0.15)]'>
                                <LuListFilter size={36} className='text-cyan-400' />
                            </div>
                            <h3 className='text-xl md:text-2xl font-mono font-black text-white tracking-tight'>
                                {searchQuery
                                    ? "No Tasks Found 🔍"
                                    : filterStatus === "All"
                                        ? "No Tasks Assigned Yet 📋"
                                        : `No ${filterStatus} Tasks 📋`
                                }
                            </h3>
                            <p className='text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm'>
                                {searchQuery
                                    ? `No tasks matched "${searchQuery}". Try different keywords.`
                                    : filterStatus === "All"
                                        ? "You don't have any tasks assigned yet. Your admin will assign tasks to you soon."
                                        : `You don't have any tasks with "${filterStatus}" status. Try switching to a different filter.`
                                }
                            </p>
                            {searchQuery && (
                                <div className="relative group cursor-pointer mt-7">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className='relative h-11 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all shadow-lg active:scale-95 text-xs sm:text-sm'
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Result count */}
                            <div className='flex items-center justify-between px-1'>
                                <p className='text-xs sm:text-sm font-mono text-zinc-400'>
                                    Showing{" "}
                                    <span className='font-bold text-cyan-400'>
                                        {filteredTasks.length}
                                    </span>{" "}
                                    task{filteredTasks.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {/* ── Task Cards Grid ── */}
                            <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6'>
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