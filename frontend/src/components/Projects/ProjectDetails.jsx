import React, { useContext, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext.jsx';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import {
    LuArrowLeft,
    LuPencil,
    LuArchive,
    LuTrash2,
    LuUsers,
    LuCalendarDays,
    LuCrown,
    LuListChecks,
    LuCircleCheckBig,
    LuClock,
    LuTriangleAlert,
    LuPlus,
    LuUpload,
    LuFile,
    LuImage,
    LuVideo,
    LuFileText,
    LuFolderOpen,
    LuArrowUpRight,
    LuActivity,
    LuHash,
    LuX,
    LuChevronDown
} from 'react-icons/lu';

import TaskCard from '../Cards/TaskCard.jsx';
import moment from 'moment';
import CreateProjectModal from './CreateProjectModal.jsx';
import ManageMembersModal from './ManageMembersModal.jsx';
import TaskStatusTabs from '../../components/TaskStatusTabs.jsx';

const SkeletonBlock = ({ className }) => (
    <div className={`bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer rounded-xl border border-white/5 ${className}`} />
);

const StatMini = ({ label, value, icon, accent }) => (
    <div className='bg-zinc-900/60 border border-white/5 rounded-2xl p-4 shadow-inner flex items-center gap-3'>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${accent}`}>
            {icon}
        </div>
        <div className='min-w-0'>
            <p className='text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>{label}</p>
            <p className='text-lg font-mono font-black text-white'>{value ?? 0}</p>
        </div>
    </div>
);

const getFileStyle = (type) => {
    switch (type) {
        case "image": return { icon: <LuImage className="text-cyan-400 text-lg stroke-[2.5]" />, wrapper: "bg-cyan-500/10 border-cyan-500/20" };
        case "video": return { icon: <LuVideo className="text-purple-400 text-lg stroke-[2.5]" />, wrapper: "bg-purple-500/10 border-purple-500/20" };
        case "pdf": return { icon: <LuFileText className="text-rose-400 text-lg stroke-[2.5]" />, wrapper: "bg-rose-500/10 border-rose-500/20" };
        default: return { icon: <LuFile className="text-zinc-400 text-lg stroke-[2.5]" />, wrapper: "bg-zinc-800/50 border-white/10" };
    }
};

const ProjectDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Overview");

    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const [files, setFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [activity, setActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [membersModalOpen, setMembersModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ─────────────────────────────────────────
    // FETCHERS
    // ─────────────────────────────────────────

    const fetchProject = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_BY_ID(id));
            setProject(response?.data?.project || null);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to load project");
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            setTasksLoading(true);
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                params: { project: id }
            });
            setTasks(response?.data?.tasks || []);
        } catch (error) {
            console.error(error);
        } finally {
            setTasksLoading(false);
        }
    };

    const fetchFiles = async () => {
        try {
            setFilesLoading(true);
            const response = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_FILES(id));
            setFiles(response?.data?.files || []);
        } catch (error) {
            console.error(error);
        } finally {
            setFilesLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            setActivityLoading(true);
            const response = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_ACTIVITY(id));
            setActivity(response?.data?.activity || []);
        } catch (error) {
            console.error(error);
        } finally {
            setActivityLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        fetchTasks();
        fetchFiles();
        fetchActivity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (activeTab === "Tasks") fetchTasks();
        if (activeTab === "Files") fetchFiles();
        if (activeTab === "Activity") fetchActivity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, id]);

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

    // ─────────────────────────────────────────
    // ACTIONS
    // ─────────────────────────────────────────

    const handleStatusChange = async (status) => {
        try {
            await axiosInstance.put(API_PATHS.PROJECTS.UPDATE_PROJECT_STATUS(id), { status });
            toast.success("Project status updated");
            fetchProject();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update status");
        }
    };

    const handleArchive = async () => {
        try {
            await axiosInstance.put(API_PATHS.PROJECTS.ARCHIVE_PROJECT(id));
            toast.success("Project archived");
            fetchProject();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to archive project");
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(id));
            toast.success("Project deleted successfully");
            navigate("/admin/projects");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete project");
        } finally {
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    const handleFileUpload = async (e) => {
        try {
            const selectedFile = e.target.files[0];
            if (!selectedFile) return;

            setUploading(true);

            const formData = new FormData();
            formData.append("title", selectedFile.name);
            formData.append("projectId", id);
            formData.append("file", selectedFile);

            await axiosInstance.post(API_PATHS.FILES.UPLOAD_FILE, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("File uploaded successfully");
            fetchFiles();
            if (activeTab === "Activity") fetchActivity();

        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await axiosInstance.delete(API_PATHS.FILES.DELETE_FILE(fileId));
            toast.success("File deleted");
            setFiles((prev) => prev.filter((f) => f._id !== fileId));
        } catch (error) {
            toast.error("Failed to delete file");
        }
    };

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────

    if (loading) {
        return (
            <DashboardLayout activeMenu="Manage Projects">
                <div className='space-y-6 py-4'>
                    <SkeletonBlock className='h-10 w-64 rounded-xl' />
                    <SkeletonBlock className='h-40 w-full rounded-[2rem]' />
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className='h-24 rounded-2xl' />)}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout activeMenu="Manage Projects">
                <div className='py-20 text-center'>
                    <p className='text-zinc-400 font-mono'>Project not found.</p>
                    <button onClick={() => navigate("/admin/projects")} className='mt-4 text-cyan-400 font-mono text-sm underline'>
                        Go back to Manage Projects
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="Manage Projects">
            <div className='space-y-6'>

                {/* Back + Header */}
                <div>
                    <div className="relative group/btn w-fit mb-5 cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-40 group-hover/btn:opacity-100 transition duration-300"></div>
                        <button
                            onClick={() => navigate("/admin/projects")}
                            className="relative flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm font-mono font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-95 shadow-lg"
                        >
                            <LuArrowLeft className="text-sm sm:text-base text-cyan-400 stroke-[3]" />
                            <span>Back to Projects</span>
                        </button>
                    </div>

                    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
                        <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4'>
                            <div className='min-w-0'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <span className='text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider inline-flex items-center gap-1'>
                                        <LuHash size={10} />{project.projectCode}
                                    </span>
                                    <span className='text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-white/10 uppercase tracking-wider'>
                                        {project.status}
                                    </span>
                                    <span className='text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-white/10 uppercase tracking-wider'>
                                        {project.priority}
                                    </span>
                                </div>
                                <h1 className='text-2xl md:text-3xl font-black text-white tracking-tight mt-2'>
                                    {project.name}
                                </h1>
                                <p className='text-sm text-zinc-400 mt-1.5 font-mono max-w-2xl'>
                                    {project.description || "No description provided."}
                                </p>
                            </div>

                            <div className='flex flex-wrap items-center gap-2 shrink-0'>
                                <div className="relative">
                                    <select
                                        value={project.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className='appearance-none h-10 pl-3 pr-10 min-w-[125px] rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 text-xs font-mono font-bold text-white shadow-inner cursor-pointer'
                                    >
                                        {["Planning", "Active", "On Hold", "Completed", "Archived"].map((s) => (
                                            <option key={s} value={s} className="bg-zinc-900">{s}</option>
                                        ))}
                                    </select>
                                    <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                </div>

                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className='h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-cyan-400 transition-all cursor-pointer shadow-inner'
                                    title="Edit Project"
                                >
                                    <LuPencil size={15} />
                                </button>

                                <button
                                    onClick={handleArchive}
                                    className='h-10 w-10 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-400 transition-all cursor-pointer shadow-inner'
                                    title="Archive Project"
                                >
                                    <LuArchive size={15} />
                                </button>

                                <button
                                    onClick={() => setDeleteModal(true)}
                                    className='h-10 w-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-inner'
                                    title="Delete Project"
                                >
                                    <LuTrash2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='overflow-x-auto scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0'>
                    <div className='min-w-max'>
                        <TaskStatusTabs
                            tabs={[
                                { label: "Overview", count: "-" },
                                { label: "Tasks", count: tasks.length },
                                { label: "Team", count: (project.members?.length || 0) + (project.projectLead ? 1 : 0) },
                                { label: "Files", count: files.length },
                                { label: "Activity", count: activity.length }
                            ]}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                </div>

                {/* ── OVERVIEW ── */}
                {activeTab === "Overview" && (
                    <div className='space-y-5'>
                        <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
                            <StatMini label="Total Tasks" value={project.totalTasks} icon={<LuListChecks className='text-cyan-400' size={16} />} accent='bg-cyan-500/10 border-cyan-500/20' />
                            <StatMini label="Completed" value={project.completedTasks} icon={<LuCircleCheckBig className='text-emerald-400' size={16} />} accent='bg-emerald-500/10 border-emerald-500/20' />
                            <StatMini label="Pending" value={project.pendingTasks} icon={<LuClock className='text-zinc-400' size={16} />} accent='bg-zinc-500/10 border-zinc-500/20' />
                            <StatMini label="In Progress" value={project.inProgressTasks} icon={<LuActivity className='text-amber-400' size={16} />} accent='bg-amber-500/10 border-amber-500/20' />
                            <StatMini label="Overdue" value={project.overdueTasks} icon={<LuTriangleAlert className='text-rose-400' size={16} />} accent='bg-rose-500/10 border-rose-500/20' />
                        </div>

                        <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
                            <div className='flex items-center justify-between mb-2'>
                                <p className='text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider'>Overall Progress</p>
                                <p className='text-lg font-mono font-black text-cyan-400'>{project.progress || 0}%</p>
                            </div>
                            <div className='w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5'>
                                <div
                                    className='h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500'
                                    style={{ width: `${project.progress || 0}%` }}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <LuCrown className='text-cyan-400' size={14} />
                                    <p className='text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Project Lead</p>
                                </div>
                                <p className='text-sm font-mono font-bold text-white'>{project.projectLead?.name || "Unassigned"}</p>
                                <p className='text-xs font-mono text-zinc-500 mt-0.5'>{project.projectLead?.email}</p>
                            </div>

                            <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <LuUsers className='text-cyan-400' size={14} />
                                    <p className='text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Members</p>
                                </div>
                                <p className='text-sm font-mono font-bold text-white'>{(project.members?.length || 0) + 1} People</p>
                            </div>

                            <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <LuCalendarDays className='text-cyan-400' size={14} />
                                    <p className='text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Timeline</p>
                                </div>
                                <p className='text-xs font-mono font-bold text-white'>
                                    {project.startDate ? moment(project.startDate).format("DD MMM YYYY") : "—"}
                                    {" → "}
                                    {project.dueDate ? moment(project.dueDate).format("DD MMM YYYY") : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TASKS ── */}
                {activeTab === "Tasks" && (
                    <div className='space-y-5'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-mono text-zinc-400'>
                                Showing <span className='font-bold text-cyan-400'>{tasks.length}</span> tasks in this project
                            </p>
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    onClick={() => navigate("/admin/create-task", { state: { projectId: id, projectName: project.name } })}
                                    className='relative h-10 px-4 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs font-mono font-bold border border-white/10 transition-all cursor-pointer active:scale-95'
                                >
                                    <LuPlus size={14} className='text-cyan-400 stroke-[3]' />
                                    Create Task
                                </button>
                            </div>
                        </div>

                        {tasksLoading ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                                {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className='h-64 rounded-[2rem]' />)}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className='bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-16 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl'>
                                <LuListChecks className='text-4xl text-cyan-400 mb-3' />
                                <h3 className='text-lg font-black text-white'>No tasks in this project yet</h3>
                                <p className='text-zinc-400 max-w-md mt-1 font-mono text-xs'>Create a task and select this project to link it here.</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                                {tasks.map((task, index) => (
                                    <TaskCard
                                        key={task._id}
                                        title={task.title}
                                        description={task.description}
                                        priority={task.priority}
                                        status={task.status}
                                        progress={task.progress}
                                        createdAt={task.createdAt}
                                        dueDate={task.dueDate}
                                        assignedTo={task.assignedTo?.map((m) => ({ image: m.profileImageUrl || null, name: m.name || "" }))}
                                        attachmentCount={task.attachments?.length || 0}
                                        completedTodoCount={task.completedTodoCount || 0}
                                        todoChecklist={task.todoChecklist || []}
                                        index={index}
                                        onClick={() => navigate("/admin/create-task", { state: { taskId: task._id } })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TEAM ── */}
                {activeTab === "Team" && (
                    <div className='space-y-5'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-mono text-zinc-400'>
                                <span className='font-bold text-cyan-400'>{(project.members?.length || 0) + 1}</span> members in this project
                            </p>
                            <button
                                onClick={() => setMembersModalOpen(true)}
                                className='h-10 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-inner'
                            >
                                <LuUsers size={14} className='text-cyan-400' />
                                Manage Team
                            </button>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                            {project.projectLead && (
                                <div className='bg-zinc-950/60 backdrop-blur-3xl border border-cyan-500/20 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3'>
                                    <div className='w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0'>
                                        <LuCrown className='text-cyan-400' size={18} />
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-mono font-bold text-white truncate'>{project.projectLead.name}</p>
                                        <p className='text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider'>Project Lead</p>
                                    </div>
                                </div>
                            )}

                            {(project.members || []).map((m) => (
                                <div key={m.user?._id} className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3'>
                                    <div className='w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-sm font-mono font-bold text-zinc-300'>
                                        {m.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-mono font-bold text-white truncate'>{m.user?.name}</p>
                                        <p className='text-[10px] font-mono text-zinc-500 uppercase tracking-wider'>{m.role || "Member"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── FILES ── */}
                {activeTab === "Files" && (
                    <div className='space-y-5'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-mono text-zinc-400'>
                                <span className='font-bold text-cyan-400'>{files.length}</span> files
                            </p>

                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <label className="relative h-10 px-4 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 text-xs font-mono font-bold border border-white/10 transition-all cursor-pointer active:scale-95">
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <LuUpload size={14} className='text-cyan-400 stroke-[3]' />}
                                    {uploading ? "Uploading..." : "Upload File"}
                                    <input type="file" hidden onChange={handleFileUpload} accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
                                </label>
                            </div>
                        </div>

                        {filesLoading ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                                {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className='h-40 rounded-[2rem]' />)}
                            </div>
                        ) : files.length === 0 ? (
                            <div className='bg-zinc-950/40 border border-dashed border-white/10 rounded-[2.5rem] py-16 px-6 flex flex-col items-center justify-center text-center backdrop-blur-xl'>
                                <LuFolderOpen className='text-4xl text-cyan-400 mb-3' />
                                <h3 className='text-lg font-black text-white'>No files uploaded yet</h3>
                                <p className='text-zinc-400 max-w-md mt-1 font-mono text-xs'>Upload requirements, designs, or documentation for this project.</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                                {files.map((file) => {
                                    const style = getFileStyle(file.fileType);
                                    return (
                                        <div key={file._id} className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${style.wrapper}`}>
                                                    {style.icon}
                                                </div>
                                                <span className="text-[10px] font-mono font-bold uppercase bg-zinc-900 border border-white/5 text-zinc-400 px-2.5 py-1 rounded-lg">
                                                    {file.fileType}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <h3 className="font-mono font-bold text-sm text-white truncate">{file.title}</h3>
                                                <p className="text-xs font-mono text-zinc-500 mt-1 truncate">{file.uploadedBy?.name}</p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                                                <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex-1 h-9 rounded-xl bg-zinc-900 text-white text-xs font-mono font-bold border border-white/10 flex items-center justify-center gap-1.5">
                                                    Open <LuArrowUpRight size={13} className="text-cyan-400" />
                                                </a>
                                                <button onClick={() => handleDeleteFile(file._id)} className="h-9 w-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer">
                                                    <LuTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ACTIVITY ── */}
                {activeTab === "Activity" && (
                    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'>
                        {activityLoading ? (
                            <div className='space-y-3'>
                                {[...Array(5)].map((_, i) => <SkeletonBlock key={i} className='h-12 rounded-xl' />)}
                            </div>
                        ) : activity.length === 0 ? (
                            <div className='py-12 text-center'>
                                <LuActivity className='text-4xl text-cyan-400 mx-auto mb-3' />
                                <p className='text-zinc-400 font-mono text-sm'>No activity recorded yet.</p>
                            </div>
                        ) : (
                            <div className='space-y-0'>
                                {activity.map((item, idx) => (
                                    <div key={item._id || idx} className='flex gap-3 pb-5 relative'>
                                        {idx !== activity.length - 1 && (
                                            <div className='absolute left-[15px] top-8 bottom-0 w-[1.5px] bg-white/5'></div>
                                        )}
                                        <div className='w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 z-10'>
                                            <div className='w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
                                        </div>
                                        <div className='min-w-0 pt-0.5'>
                                            <p className='text-xs sm:text-sm font-mono text-zinc-200'>{item.message}</p>
                                            <p className='text-[10px] font-mono text-zinc-500 mt-0.5'>
                                                {moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateProjectModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSuccess={fetchProject}
                editProject={project}
            />

            <ManageMembersModal
                isOpen={membersModalOpen}
                onClose={() => setMembersModalOpen(false)}
                project={project}
                onSuccess={fetchProject}
            />

            {deleteModal && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                    <div className="relative w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 animate-[modalPop_.25s_ease] overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                        <button
                            onClick={() => setDeleteModal(false)}
                            className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
                        >
                            <LuX className="text-base" />
                        </button>

                        <h2 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight leading-snug pr-8">
                            Delete Project
                        </h2>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-2 leading-relaxed">
                            Are you sure you want to delete <span className="text-white font-bold">{project.name}</span>? Linked tasks will not be deleted, they'll just be unlinked. This action cannot be undone.
                        </p>

                        <div className="mt-7 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                            <button
                                onClick={() => setDeleteModal(false)}
                                className="w-full h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono font-bold text-xs sm:text-sm transition-all shadow-inner cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full h-11 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer"
                            >
                                {deleting ? <><Loader2 size={15} className="animate-spin" />Deleting...</> : <><LuTrash2 size={15} />Delete Project</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
};

export default ProjectDetails;