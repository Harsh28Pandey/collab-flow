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
import { LuArrowRight } from 'react-icons/lu';
import TaskListTable from '../../components/TaskListTable.jsx';
import CustomPieChart from '../../components/Charts/CustomPieChart.jsx';
import CustomBarChart from '../../components/Charts/CustomBarChart.jsx';

// Updated Colors for Charts to match the warm theme
const COLORS = ["#f97316", "#eab308", "#22c55e"];

// ─── Skeleton Components ──────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-slate-100 via-orange-50 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`} />
);

const DashboardSkeleton = () => (
    <div className='space-y-5 my-5'>

        {/* Welcome card skeleton */}
        <div className='bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div className='space-y-2.5'>
                    <SkeletonBlock className='h-7 w-56' />
                    <SkeletonBlock className='h-3.5 w-36' />
                </div>
                <SkeletonBlock className='h-9 w-40 rounded-full' />
            </div>

            {/* Info cards skeleton */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className='rounded-2xl p-4 space-y-3 border border-slate-100'>
                        <SkeletonBlock className='h-3 w-20' />
                        <SkeletonBlock className='h-7 w-12' />
                    </div>
                ))}
            </div>
        </div>

        {/* Charts skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[...Array(2)].map((_, i) => (
                <div key={i} className='bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4'>
                    <SkeletonBlock className='h-4 w-36' />
                    <SkeletonBlock className='h-52 w-full rounded-2xl' />
                </div>
            ))}
        </div>

        {/* Table skeleton */}
        <div className='bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3'>
            <div className='flex items-center justify-between'>
                <SkeletonBlock className='h-5 w-28' />
                <SkeletonBlock className='h-5 w-16' />
            </div>
            <SkeletonBlock className='h-10 w-full rounded-xl' />
            {[...Array(5)].map((_, i) => (
                <SkeletonBlock key={i} className='h-12 w-full rounded-xl' />
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
                animation: shimmer 1.5s infinite linear;
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
                    <div className='bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] my-5'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                            <div>
                                <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight'>
                                    Welcome Back, {user?.name}! <span className="inline-block hover:animate-bounce cursor-default">👋</span>
                                </h2>
                                <p className='text-xs md:text-sm text-slate-500 mt-1.5 font-semibold tracking-wide'>
                                    {moment().format("dddd, Do MMM YYYY")}
                                </p>
                            </div>

                            {/* Team Badge */}
                            {user?.teamName && (
                                <div className='flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full self-start sm:self-auto shadow-sm'>
                                    <div className='w-2 h-2 rounded-full bg-orange-500 animate-pulse'></div>
                                    <span className='text-xs font-bold text-orange-700 tracking-wide'>
                                        {user.teamName}
                                    </span>
                                    <span className='text-xs text-orange-400 font-semibold'>
                                        • {user.teamCode}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info Cards */}
                        {dashboardData?.charts?.taskDistribution?.All > 0 ? (
                            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6'>
                                <InfoCard
                                    label="Total Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
                                    color="bg-slate-800"
                                />
                                <InfoCard
                                    label="Pending Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
                                    color="bg-orange-500"
                                />
                                <InfoCard
                                    label="In Progress Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
                                    color="bg-amber-500"
                                />
                                <InfoCard
                                    label="Completed Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
                                    color="bg-yellow-500"
                                />

                                <InfoCard
                                    label="Total Groups"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.totalGroups || 0
                                    )}
                                    color="bg-rose-500"
                                />

                                <InfoCard
                                    label="Total Files"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.totalFiles || 0
                                    )}
                                    color="bg-fuchsia-500"
                                />

                                <InfoCard
                                    label="Active Polls"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.activePolls || 0
                                    )}
                                    color="bg-emerald-500"
                                />

                                <InfoCard
                                    label="Closed Polls"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.closedPolls || 0
                                    )}
                                    color="bg-slate-400"
                                />
                            </div>
                        ) : (
                            /* Empty State */
                            <div className='flex flex-col items-center justify-center py-12 px-4 mt-6 bg-slate-50/50 rounded-3xl border border-slate-100 border-dashed'>
                                <div className='w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 shadow-sm'>
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                        <rect x="6" y="8" width="28" height="4" rx="2" fill="#fed7aa" />
                                        <rect x="6" y="16" width="20" height="4" rx="2" fill="#fed7aa" />
                                        <rect x="6" y="24" width="24" height="4" rx="2" fill="#fed7aa" />
                                        <circle cx="32" cy="28" r="8" fill="#f97316" />
                                        <path d="M29 28L31 30L35 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className='text-lg md:text-xl font-extrabold text-slate-800 text-center mb-2 tracking-tight'>
                                    No Tasks Yet — Let's Get Started! 🚀
                                </h3>
                                <p className='text-sm text-slate-500 font-medium text-center max-w-sm leading-relaxed mb-8'>
                                    Your dashboard will show task stats, charts, and progress once you create your first task. Start by assigning a task to your team.
                                </p>
                                <button
                                    onClick={() => navigate("/admin/create-task")}
                                    className='flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-white text-sm font-bold px-6 py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer'
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                    Create First Task
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Charts + Recent Tasks */}
                    {dashboardData?.charts?.taskDistribution?.All > 0 && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 my-4 md:my-6'>

                            {/* Task Distribution Chart */}
                            <div className='bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)]'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h5 className='font-bold text-slate-800 tracking-tight'>Task Distribution</h5>
                                </div>
                                <CustomPieChart data={pieChartData} colors={COLORS} />
                            </div>

                            {/* Task Priority Chart */}
                            <div className='bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)]'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h5 className='font-bold text-slate-800 tracking-tight'>Task Priority Levels</h5>
                                </div>
                                <CustomBarChart data={barChartData} />
                            </div>

                            {/* Recent Tasks Table */}
                            <div className='md:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)]'>
                                <div className='flex items-center justify-between mb-5'>
                                    <h5 className='text-lg font-extrabold text-slate-800 tracking-tight'>Recent Tasks</h5>
                                    <button
                                        className='flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all cursor-pointer'
                                        onClick={onSeeMore}
                                    >
                                        See All <LuArrowRight className='text-base' />
                                    </button>
                                </div>
                                <TaskListTable tableData={dashboardData?.recentTasks || []} />
                            </div>

                        </div>
                    )}
                </>
            )}

        </DashboardLayout>
    )
}

export default Dashboard;