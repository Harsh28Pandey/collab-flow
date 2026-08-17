import React, { useContext, useEffect, useState } from 'react';
import { LuX, LuFolderPlus, LuUsers } from 'react-icons/lu';
import { Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext.jsx';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ["Planning", "Active", "On Hold", "Completed", "Archived"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

const inputClass = 'w-full h-11 px-4 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 transition-all shadow-inner';
const labelClass = 'text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block';

const CreateProjectModal = ({ isOpen, onClose, onSuccess, editProject = null }) => {

    const { user } = useContext(UserContext);
    const isEditMode = Boolean(editProject);

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        projectCode: "",
        startDate: "",
        dueDate: "",
        priority: "Medium",
        status: "Planning",
        projectLead: "",
        members: []
    });

    // fetch team users for lead/member selection
    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
                setUsers(response?.data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load team members");
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [isOpen]);

    // pre-fill form when editing
    useEffect(() => {
        if (isOpen && editProject) {
            setForm({
                name: editProject.name || "",
                description: editProject.description || "",
                projectCode: editProject.projectCode || "",
                startDate: editProject.startDate ? editProject.startDate.substring(0, 10) : "",
                dueDate: editProject.dueDate ? editProject.dueDate.substring(0, 10) : "",
                priority: editProject.priority || "Medium",
                status: editProject.status || "Planning",
                projectLead: editProject.projectLead?._id || "",
                members: (editProject.members || []).map((m) => m.user?._id).filter(Boolean)
            });
        } else if (isOpen && !editProject) {
            setForm({
                name: "",
                description: "",
                projectCode: "",
                startDate: "",
                dueDate: "",
                priority: "Medium",
                status: "Planning",
                projectLead: user?._id || "",
                members: []
            });
        }
    }, [isOpen, editProject, user]);

    const toggleMember = (userId) => {
        setForm((prev) => {
            const exists = prev.members.includes(userId);
            return {
                ...prev,
                members: exists
                    ? prev.members.filter((id) => id !== userId)
                    : [...prev.members, userId]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.projectCode.trim() || !form.projectLead) {
            toast.error("Project name, code and project lead are required");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                projectCode: form.projectCode.trim(),
                startDate: form.startDate || undefined,
                dueDate: form.dueDate || undefined,
                priority: form.priority,
                status: form.status,
                projectLead: form.projectLead,
                members: form.members
            };

            if (isEditMode) {
                await axiosInstance.put(API_PATHS.PROJECTS.UPDATE_PROJECT(editProject._id), payload);
                toast.success("Project updated successfully");
            } else {
                await axiosInstance.post(API_PATHS.PROJECTS.CREATE_PROJECT, payload);
                toast.success("Project created successfully");
            }

            onSuccess?.();
            onClose();

        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to save project");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">

            <div className="relative w-full max-w-2xl bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 my-8 animate-[modalPop_.25s_ease] overflow-hidden">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
                >
                    <LuX className="text-base" />
                </button>

                <div className="flex items-center gap-3 pr-8">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <LuFolderPlus className="text-cyan-400 text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-tight">
                            {isEditMode ? "Edit Project" : "Create New Project"}
                        </h2>
                        <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-0.5">
                            {isEditMode ? "Update project details" : "Fill in details to start a new project"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1 scrollbar-hide">

                    <div>
                        <label className={labelClass}>Project Name *</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="e.g. Collab Flow Redesign"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            rows={3}
                            className={`${inputClass} h-auto py-3 resize-none`}
                            placeholder="What is this project about?"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Project Code *</label>
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="e.g. CF-2026"
                                value={form.projectCode}
                                onChange={(e) => setForm({ ...form, projectCode: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Status</label>
                            <select
                                className={inputClass}
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="bg-zinc-900">{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Due Date</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Priority</label>
                            <select
                                className={inputClass}
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            >
                                {PRIORITY_OPTIONS.map((p) => (
                                    <option key={p} value={p} className="bg-zinc-900">{p}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Project Lead *</label>
                            <select
                                className={inputClass}
                                value={form.projectLead}
                                onChange={(e) => setForm({ ...form, projectLead: e.target.value })}
                            >
                                <option value="" className="bg-zinc-900">Select lead</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id} className="bg-zinc-900">{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>
                            <span className="inline-flex items-center gap-1.5">
                                <LuUsers className="text-cyan-400" size={12} />
                                Team Members
                            </span>
                        </label>

                        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 max-h-40 overflow-y-auto scrollbar-hide shadow-inner">
                            {loadingUsers ? (
                                <p className="text-xs font-mono text-zinc-500 text-center py-4">Loading team...</p>
                            ) : users.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 text-center py-4">No users found</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {users
                                        .filter((u) => u._id !== form.projectLead)
                                        .map((u) => (
                                            <label
                                                key={u._id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs font-mono ${form.members.includes(u._id)
                                                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                                    : 'bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-900'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="accent-cyan-500 shrink-0"
                                                    checked={form.members.includes(u._id)}
                                                    onChange={() => toggleMember(u._id)}
                                                />
                                                <span className="truncate">{u.name}</span>
                                            </label>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full h-11 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono font-bold text-xs sm:text-sm transition-all shadow-inner cursor-pointer"
                        >
                            Cancel
                        </button>

                        <div className="relative group cursor-pointer w-full">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="relative w-full h-11 rounded-2xl bg-zinc-950 text-white font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 transition-all shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin text-cyan-400" />
                                        Saving...
                                    </>
                                ) : (
                                    isEditMode ? "Save Changes" : "Create Project"
                                )}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;