import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';

import {
    LuSearch,
    LuPlus,
    LuListFilter,
    LuRefreshCcw,
    LuFolderKanban,
    LuFolderClock,
    LuFolderCheck,
    LuFolderX,
    LuChevronDown
} from 'react-icons/lu';

import TaskStatusTabs from '../../components/TaskStatusTabs.jsx';
import ProjectCard from '../../components/Cards/ProjectCard.jsx';

import toast from 'react-hot-toast';
import CreateProjectModal from '../../components/Projects/CreateProjectModal.jsx';

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const ProjectCardSkeleton = () => (
    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4'>
        <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-5 w-20 rounded-full' />
            <SkeletonBlock className='h-5 w-16 rounded-full' />
        </div>
        <SkeletonBlock className='h-6 w-3/4 rounded-lg' />
        <div className='space-y-2'>
            <SkeletonBlock className='h-3 w-full rounded-md' />
            <SkeletonBlock className='h-3 w-5/6 rounded-md' />
        </div>
        <SkeletonBlock className='h-2 w-full rounded-full' />
        <div className='flex items-center justify-between'>
            <div className='flex -space-x-2'>
                {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} className='h-8 w-8 rounded-full border border-zinc-950' />
                ))}
            </div>
            <SkeletonBlock className='h-4 w-24 rounded-full' />
        </div>
    </div>
);

const ManageProjectsSkeleton = () => (
    <div className='space-y-6 py-4'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} className='h-24 rounded-2xl' />
            ))}
        </div>
        <div className='flex flex-col lg:flex-row gap-3'>
            <SkeletonBlock className='h-12 flex-1 rounded-2xl' />
            <SkeletonBlock className='h-12 w-full lg:w-48 rounded-2xl' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
            {[...Array(6)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, accent }) => (
    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center gap-3'>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${accent}`}>
            {icon}
        </div>
        <div className='min-w-0'>
            <p className='text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>{label}</p>
            <p className='text-xl font-mono font-black text-white'>{value ?? 0}</p>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const ManageProjects = () => {

    const navigate = useNavigate();

    const [allProjects, setAllProjects] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);

    const [filterStatus, setFilterStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);

    // ─────────────────────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────────────────────

    const getAllProjects = async () => {
        try {
            if (!loading) setRefreshing(true);

            const response = await axiosInstance.get(API_PATHS.PROJECTS.GET_ALL_PROJECTS, {
                params: {
                    status: filterStatus === "All" ? "" : filterStatus,
                    priority: priorityFilter || "",
                    search: searchQuery || ""
                }
            });

            const projects = response?.data?.projects || [];
            setAllProjects(projects);

            const summary = response?.data?.statusSummary || {};
            setTabs([
                { label: "All", count: summary.all || 0 },
                { label: "Planning", count: summary.planning || 0 },
                { label: "Active", count: summary.active || 0 },
                { label: "On Hold", count: summary.onHold || 0 },
                { label: "Completed", count: summary.completed || 0 },
                { label: "Archived", count: summary.archived || 0 },
            ]);

        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error(error?.response?.data?.message || "Failed to load projects");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getDashboardStats = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.PROJECTS.GET_DASHBOARD_STATS);
            setDashboardStats(response?.data?.stats || null);
        } catch (error) {
            console.error("Error fetching project stats:", error);
        }
    };

    useEffect(() => {
        getAllProjects();
        getDashboardStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, priorityFilter]);

    // debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            getAllProjects();
        }, 400);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // shimmer + modal animations
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .animate-shimmer { animation: shimmer 2s infinite linear; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes modalPop { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn .2s ease; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const filteredProjects = useMemo(() => {
        return allProjects;
    }, [allProjects]);

    const handleCreateSuccess = () => {
        getAllProjects();
        getDashboardStats();
    };

    return (
        <DashboardLayout activeMenu="Manage Projects">

            {loading ? (
                <ManageProjectsSkeleton />
            ) : (
                <div className='space-y-6'>

                    {/* Header */}
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                        <div className='min-w-0'>
                            <h1 className='text-2xl md:text-3xl font-black text-white tracking-tight truncate'>
                                Manage Projects
                            </h1>
                            <p className='text-sm text-zinc-400 mt-1 font-mono'>
                                Create, assign and monitor every project end-to-end.
                            </p>
                        </div>

                        <div className='flex flex-wrap items-center gap-3 flex-shrink-0'>
                            <button
                                onClick={getAllProjects}
                                className='h-10 w-10 sm:w-auto sm:px-4 sm:h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center gap-2 text-sm font-mono font-bold text-zinc-300 hover:text-white shadow-inner transition-all cursor-pointer'
                            >
                                <LuRefreshCcw className={`${refreshing ? "animate-spin text-cyan-400" : ""}`} />
                                <span className='hidden sm:inline'>Refresh</span>
                            </button>

                            <div className="relative group cursor-pointer flex-1 sm:flex-none">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    onClick={() => { setEditProject(null); setCreateModalOpen(true); }}
                                    className='relative w-full sm:w-auto h-10 px-4 sm:h-11 sm:px-6 rounded-2xl bg-zinc-950 text-white flex items-center justify-center gap-2 text-sm font-mono font-bold border border-white/10 transition-all cursor-pointer active:scale-95'
                                >
                                    <LuPlus className='text-lg stroke-[3] text-cyan-400' />
                                    <span>Create Project</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                        <StatCard
                            label="Projects"
                            value={dashboardStats?.total}
                            icon={<LuFolderKanban className='text-cyan-400 text-lg' />}
                            accent='bg-cyan-500/10 border-cyan-500/20'
                        />
                        <StatCard
                            label="Active"
                            value={dashboardStats?.active}
                            icon={<LuFolderClock className='text-violet-400 text-lg' />}
                            accent='bg-violet-500/10 border-violet-500/20'
                        />
                        <StatCard
                            label="Completed"
                            value={dashboardStats?.completed}
                            icon={<LuFolderCheck className='text-emerald-400 text-lg' />}
                            accent='bg-emerald-500/10 border-emerald-500/20'
                        />
                        <StatCard
                            label="Overdue"
                            value={dashboardStats?.overdue}
                            icon={<LuFolderX className='text-rose-400 text-lg' />}
                            accent='bg-rose-500/10 border-rose-500/20'
                        />
                    </div>

                    {/* Filters */}
                    <div className='flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-2'>

                        <div className='flex flex-col sm:flex-row gap-3 flex-1'>
                            <div className='relative flex-1 max-w-xl'>
                                <LuSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-lg z-10 pointer-events-none' />
                                <input
                                    type='text'
                                    placeholder='Search projects by name or code...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner'
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className='appearance-none h-12 pl-4 pr-10 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-mono text-white shadow-inner cursor-pointer'
                                >
                                    <option value="" className="bg-zinc-900">All Priorities</option>
                                    <option value="Low" className="bg-zinc-900">Low</option>
                                    <option value="Medium" className="bg-zinc-900">Medium</option>
                                    <option value="High" className="bg-zinc-900">High</option>
                                    <option value="Urgent" className="bg-zinc-900">Urgent</option>
                                </select>
                                <LuChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className='overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0'>
                            <div className='min-w-max'>
                                <TaskStatusTabs tabs={tabs} activeTab={filterStatus} setActiveTab={setFilterStatus} />
                            </div>
                        </div>
                    </div>

                    {/* Empty / Grid */}
                    {filteredProjects.length === 0 ? (
                        <div className='bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center mt-6 backdrop-blur-xl'>
                            <div className='w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]'>
                                <LuListFilter className='text-4xl text-cyan-400' />
                            </div>
                            <h3 className='text-xl md:text-2xl font-black text-white tracking-tight'>
                                No Projects Found
                            </h3>
                            <p className='text-zinc-400 max-w-md mt-2 leading-relaxed font-mono text-xs sm:text-sm'>
                                {searchQuery
                                    ? "No projects matched your search. Try different keywords."
                                    : filterStatus === "All"
                                        ? "You haven't created any projects yet. Start by creating your first project."
                                        : `No projects available in "${filterStatus}" status.`
                                }
                            </p>
                            <div className="relative group cursor-pointer mt-6">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    onClick={() => { setEditProject(null); setCreateModalOpen(true); }}
                                    className='relative h-12 px-8 rounded-2xl bg-zinc-950 text-white font-mono font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer active:scale-95 shadow-lg'
                                >
                                    <LuPlus className='text-lg stroke-[3] text-cyan-400' />
                                    Create Project
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='flex items-center justify-between px-1'>
                                <p className='text-xs font-mono text-zinc-400'>
                                    Showing <span className='font-bold text-cyan-400'>{filteredProjects.length}</span> projects
                                </p>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                                {filteredProjects.map((project, index) => (
                                    <ProjectCard
                                        key={project._id}
                                        {...project}
                                        index={index}
                                        onClick={() => navigate(`/admin/projects/${project._id}`)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            <CreateProjectModal
                isOpen={createModalOpen}
                onClose={() => { setCreateModalOpen(false); setEditProject(null); }}
                onSuccess={handleCreateSuccess}
                editProject={editProject}
            />

        </DashboardLayout>
    );
};

export default ManageProjects;