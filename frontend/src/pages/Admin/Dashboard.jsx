import React, { useContext, useState, useEffect } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth.jsx';
import { UserContext } from '../../context/userContext.jsx';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import moment from "moment";
import InfoCard from '../../components/Cards/InfoCard.jsx';
import { addThousandSeparator } from '../../utils/helper.js';
import { LuArrowRight, LuZap, LuCode, LuTerminal } from 'react-icons/lu';
import TaskListTable from '../../components/TaskListTable.jsx';
import CustomPieChart from '../../components/Charts/CustomPieChart.jsx';
import CustomBarChart from '../../components/Charts/CustomBarChart.jsx';

// Updated Developer Neon Colors for Charts
const COLORS = ["#38bdf8", "#8b5cf6", "#10b981"]; // Cyan, Purple, Emerald

// ─── Skeleton Components (Dark Mode Cyber Pulse) ──────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const DashboardSkeleton = () => (
    <div className='space-y-6 my-2'>

        {/* Welcome card skeleton */}
        <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='space-y-3'>
                    <SkeletonBlock className='h-8 w-64 rounded-xl' />
                    <SkeletonBlock className='h-4 w-40 rounded-md' />
                </div>
                <SkeletonBlock className='h-10 w-48 rounded-full' />
            </div>

            {/* Info cards skeleton */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className='rounded-2xl p-5 space-y-4 border border-white/5 bg-zinc-900/40'>
                        <SkeletonBlock className='h-4 w-24 rounded-md' />
                        <SkeletonBlock className='h-8 w-16 rounded-lg' />
                    </div>
                ))}
            </div>
        </div>

        {/* Charts skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[...Array(2)].map((_, i) => (
                <div key={i} className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-5'>
                    <SkeletonBlock className='h-5 w-40 rounded-md' />
                    <SkeletonBlock className='h-56 w-full rounded-2xl' />
                </div>
            ))}
        </div>

        {/* Table skeleton */}
        <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4'>
            <div className='flex items-center justify-between mb-2'>
                <SkeletonBlock className='h-6 w-36 rounded-md' />
                <SkeletonBlock className='h-8 w-24 rounded-xl' />
            </div>
            <SkeletonBlock className='h-12 w-full rounded-xl bg-zinc-900/60' />
            {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} className='h-14 w-full rounded-xl' />
            ))}
        </div>
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
    useUserAuth();

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    //* prepare chart data
    const prepareChartData = (data) => {
        const taskDistribution = data?.taskDistribution || null;
        const taskPriorityLevels = data?.taskPriorityLevels || null;

        const taskDistributionData = [
            { status: "Pending", count: taskDistribution?.Pending || 0 },
            { status: "In Progress", count: taskDistribution?.InProgress || 0 },
            { status: "Completed", count: taskDistribution?.Completed || 0 },
        ];
        setPieChartData(taskDistributionData);

        const PriorityLevelData = [
            { priority: "Low", count: taskPriorityLevels?.Low || 0 },
            { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
            { priority: "High", count: taskPriorityLevels?.High || 0 },
        ];
        setBarChartData(PriorityLevelData);
    }

    const getDashboardData = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
            if (response.data) {
                setDashboardData(response.data);
                prepareChartData(response.data?.charts || null);
            }
        } catch (error) {
            console.error("Error fetching dashboard data: ", error);
        } finally {
            setLoading(false);
        }
    }

    const onSeeMore = () => navigate("/admin/tasks");

    useEffect(() => {
        getDashboardData();
        return () => { }
    }, [])

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
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <DashboardLayout activeMenu="Dashboard">

            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {/* Main Welcome Bento Box */}
                    <div className='relative bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden'>

                        {/* Ambient Card Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />

                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative z-10'>
                            <div>
                                <h2 className='text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2'>
                                    Welcome Back, {user?.name} <span className="inline-block hover:animate-bounce cursor-default text-cyan-400"><LuZap size={24} /></span>
                                </h2>
                                <p className='text-xs md:text-sm text-zinc-400 mt-1.5 font-mono tracking-wide'>
                                    System Time: {moment().format("ddd, DD MMM YYYY | HH:mm A")}
                                </p>
                            </div>

                            {/* Team Node Badge */}
                            {user?.teamName && (
                                <div className='flex items-center gap-2.5 bg-zinc-900/80 border border-white/10 px-4 py-2.5 rounded-full self-start sm:self-auto shadow-inner'>
                                    <div className='w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
                                    <span className='text-[11px] font-bold font-mono text-cyan-300 tracking-wider uppercase'>
                                        Node: {user.teamName}
                                    </span>
                                    <span className='text-[11px] text-zinc-500 font-mono border-l border-white/10 pl-2.5'>
                                        ID: {user.teamCode}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info Metrics Cards */}
                        {dashboardData?.charts?.taskDistribution?.All > 0 ? (
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 relative z-10'>
                                <InfoCard
                                    label="Total Operations"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
                                    color="bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                />
                                <InfoCard
                                    label="Pending Queues"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
                                    color="bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                />
                                <InfoCard
                                    label="Active Threads"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
                                    color="bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                />
                                <InfoCard
                                    label="Compiled Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
                                    color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                />

                                <InfoCard
                                    label="Total Clusters"
                                    value={addThousandSeparator(dashboardData?.overview?.totalGroups || 0)}
                                    color="bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                />
                                <InfoCard
                                    label="File Repositories"
                                    value={addThousandSeparator(dashboardData?.overview?.totalFiles || 0)}
                                    color="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                />
                                <InfoCard
                                    label="Active Sockets"
                                    value={addThousandSeparator(dashboardData?.overview?.activePolls || 0)}
                                    color="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                />
                                <InfoCard
                                    label="Terminated Sockets"
                                    value={addThousandSeparator(dashboardData?.overview?.closedPolls || 0)}
                                    color="bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                                />
                            </div>
                        ) : (
                            /* Empty State Terminal UI */
                            <div className='flex flex-col items-center justify-center py-14 px-4 mt-8 bg-zinc-900/50 rounded-[1.5rem] border border-white/5 border-dashed relative z-10'>
                                <div className='w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]'>
                                    <LuCode size={28} className='text-cyan-400' />
                                </div>
                                <h3 className='text-lg md:text-xl font-bold text-white text-center mb-2 tracking-tight'>
                                    Terminal Idle — Awaiting First Execution
                                </h3>
                                <p className='text-xs sm:text-sm text-zinc-500 font-mono text-center max-w-md leading-relaxed mb-8'>
                                    &gt; System metrics, live charts, and operational queues will deploy here upon task initialization.
                                </p>

                                <div className="relative group cursor-pointer">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition duration-500"></div>
                                    <button
                                        onClick={() => navigate("/admin/create-task")}
                                        className='relative flex items-center gap-2 bg-zinc-950 text-white text-sm font-mono font-bold px-6 py-3.5 rounded-xl border border-white/10 hover:border-cyan-500/50 active:scale-95 transition-all duration-300'
                                    >
                                        Initialize Workspace
                                        <LuArrowRight className="text-cyan-400" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Charts + Recent Tasks Data Visualizations */}
                    {dashboardData?.charts?.taskDistribution?.All > 0 && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 my-6'>

                            {/* Task Distribution Chart */}
                            <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h5 className='font-bold text-white tracking-tight flex items-center gap-2'>
                                        <div className='w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
                                        Task Distribution
                                    </h5>
                                </div>
                                <CustomPieChart data={pieChartData} colors={COLORS} />
                            </div>

                            {/* Task Priority Chart */}
                            <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h5 className='font-bold text-white tracking-tight flex items-center gap-2'>
                                        <div className='w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'></div>
                                        Execution Priorities
                                    </h5>
                                </div>
                                <CustomBarChart data={barChartData} />
                            </div>

                            {/* Recent Tasks Table Box */}
                            <div className='md:col-span-2 bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h5 className='text-lg font-bold text-white tracking-tight flex items-center gap-2'>
                                        <LuTerminal className="text-cyan-400" />
                                        Recent Operations
                                    </h5>
                                    <button
                                        className='flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95'
                                        onClick={onSeeMore}
                                    >
                                        Execute.All() <LuArrowRight size={14} />
                                    </button>
                                </div>

                                {/* Inner Table Wrapper for dark mode compatibility */}
                                <div className='rounded-xl overflow-hidden border border-white/5'>
                                    <TaskListTable tableData={dashboardData?.recentTasks || []} />
                                </div>

                            </div>

                        </div>
                    )}
                </>
            )}

        </DashboardLayout>
    )
}

export default Dashboard;