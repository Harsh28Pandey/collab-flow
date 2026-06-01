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

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

// ─── Skeleton Components ──────────────────────────────────────────────────────

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`} />
);

const DashboardSkeleton = () => (
    <div className='space-y-5 my-5'>

        {/* Welcome card skeleton */}
        <div className='card'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div className='space-y-2.5'>
                    <SkeletonBlock className='h-7 w-56' />
                    <SkeletonBlock className='h-3.5 w-36' />
                </div>
                <SkeletonBlock className='h-9 w-40 rounded-2xl' />
            </div>

            {/* Info cards skeleton */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className='rounded-2xl p-4 space-y-3 border border-gray-100'>
                        <SkeletonBlock className='h-3 w-20' />
                        <SkeletonBlock className='h-7 w-12' />
                    </div>
                ))}
            </div>
        </div>

        {/* Charts skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[...Array(2)].map((_, i) => (
                <div key={i} className='card space-y-4'>
                    <SkeletonBlock className='h-4 w-36' />
                    <SkeletonBlock className='h-52 w-full rounded-2xl' />
                </div>
            ))}
        </div>

        {/* Table skeleton */}
        <div className='card space-y-3'>
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
    const [loading, setLoading] = useState(true);  // ✅ loading state

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
            setLoading(false);  // ✅ loading band karo
        }
    }

    const onSeeMore = () => navigate("/admin/tasks");

    useEffect(() => {
        getDashboardData();
        return () => { }
    }, [])

    // ✅ Shimmer animation style inject
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

            {/* ✅ Loading — skeleton dikhao */}
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    <div className='card my-5'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                            <div>
                                <h2 className='text-xl md:text-2xl font-semibold'>
                                    Welcome Back, {user?.name}! 👋
                                </h2>
                                <p className='text-xs md:text-[13px] text-gray-500 mt-1.5 font-semibold'>
                                    {moment().format("dddd Do MMM YYYY")}
                                </p>
                            </div>

                            {/* Team Badge */}
                            {user?.teamName && (
                                <div className='flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl self-start sm:self-auto'>
                                    <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                                    <span className='text-xs font-semibold text-blue-600'>
                                        {user.teamName}
                                    </span>
                                    <span className='text-xs text-gray-500'>
                                        • {user.teamCode}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info Cards — sirf tab dikhenge jab tasks hon */}
                        {dashboardData?.charts?.taskDistribution?.All > 0 ? (
                            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
                                <InfoCard
                                    label="Total Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
                                    color="bg-primary"
                                />
                                <InfoCard
                                    label="Pending Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
                                    color="bg-violet-600"
                                />
                                <InfoCard
                                    label="In Progress Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
                                    color="bg-cyan-600"
                                />
                                <InfoCard
                                    label="Completed Tasks"
                                    value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
                                    color="bg-lime-600"
                                />

                                <InfoCard
                                    label="Total Groups"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.totalGroups || 0
                                    )}
                                    color="bg-orange-500"
                                />

                                <InfoCard
                                    label="Total Files"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.totalFiles || 0
                                    )}
                                    color="bg-pink-600"
                                />

                                <InfoCard
                                    label="Active Polls"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.activePolls || 0
                                    )}
                                    color="bg-emerald-600"
                                />

                                <InfoCard
                                    label="Closed Polls"
                                    value={addThousandSeparator(
                                        dashboardData?.overview?.closedPolls || 0
                                    )}
                                    color="bg-rose-600"
                                />
                            </div>
                        ) : (
                            /* Empty State */
                            <div className='flex flex-col items-center justify-center py-12 px-4 mt-4'>
                                <div className='w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6'>
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                        <rect x="6" y="8" width="28" height="4" rx="2" fill="#BFDBFE" />
                                        <rect x="6" y="16" width="20" height="4" rx="2" fill="#BFDBFE" />
                                        <rect x="6" y="24" width="24" height="4" rx="2" fill="#BFDBFE" />
                                        <circle cx="32" cy="28" r="8" fill="#3B82F6" />
                                        <path d="M29 28L31 30L35 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className='text-lg md:text-xl font-bold text-gray-800 text-center mb-2'>
                                    No Tasks Yet — Let's Get Started! 🚀
                                </h3>
                                <p className='text-sm text-gray-400 text-center max-w-sm leading-relaxed mb-8'>
                                    Your dashboard will show task stats, charts, and progress once you create your first task. Start by assigning a task to your team.
                                </p>
                                <button
                                    onClick={() => navigate("/admin/create-task")}
                                    className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer'
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Create First Task
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Charts + Recent Tasks */}
                    {dashboardData?.charts?.taskDistribution?.All > 0 && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6'>
                            <div>
                                <div className='card'>
                                    <div className='flex items-center justify-between'>
                                        <h5 className='font-medium'>Task Distribution</h5>
                                    </div>
                                    <CustomPieChart data={pieChartData} colors={COLORS} />
                                </div>
                            </div>
                            <div>
                                <div className='card'>
                                    <div className='flex items-center justify-between'>
                                        <h5 className='font-medium'>Task Priority Levels</h5>
                                    </div>
                                    <CustomBarChart data={barChartData} />
                                </div>
                            </div>
                            <div className='md:col-span-2'>
                                <div className='card'>
                                    <div className='flex items-center justify-between'>
                                        <h5 className='text-lg'>Recent Tasks</h5>
                                        <button className='card-btn cursor-pointer' onClick={onSeeMore}>
                                            See All <LuArrowRight className='text-base cursor-pointer' />
                                        </button>
                                    </div>
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

export default Dashboard