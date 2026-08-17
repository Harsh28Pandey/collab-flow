import React, { useEffect, useState } from 'react';
import { LuX, LuUserPlus, LuUserMinus, LuCrown } from 'react-icons/lu';
import { Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import toast from 'react-hot-toast';

const ManageMembersModal = ({ isOpen, onClose, project, onSuccess }) => {

    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
                setAllUsers(response?.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [isOpen]);

    if (!isOpen || !project) return null;

    const existingMemberIds = new Set([
        project.projectLead?._id,
        ...(project.members || []).map((m) => m.user?._id)
    ]);

    const availableUsers = allUsers.filter((u) => !existingMemberIds.has(u._id));

    const handleAddMember = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user to add");
            return;
        }

        try {
            setBusy(true);
            await axiosInstance.post(API_PATHS.PROJECTS.ADD_MEMBER(project._id), { userId: selectedUserId });
            toast.success("Member added successfully");
            setSelectedUserId("");
            onSuccess?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add member");
        } finally {
            setBusy(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            setBusy(true);
            await axiosInstance.delete(API_PATHS.PROJECTS.REMOVE_MEMBER(project._id, memberId));
            toast.success("Member removed successfully");
            onSuccess?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to remove member");
        } finally {
            setBusy(false);
        }
    };

    const handleMakeLead = async (userId) => {
        try {
            setBusy(true);
            await axiosInstance.put(API_PATHS.PROJECTS.CHANGE_PROJECT_LEAD(project._id), { userId });
            toast.success("Project lead updated");
            onSuccess?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to change project lead");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">

            <div className="relative w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-7 my-8 animate-[modalPop_.25s_ease] overflow-hidden">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
                >
                    <LuX className="text-base" />
                </button>

                <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-tight pr-8">
                    Manage Team
                </h2>
                <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-1">
                    Add, remove members or change project lead
                </p>

                {/* Add Member */}
                <div className="mt-5 flex items-center gap-2">
                    <select
                        className="flex-1 h-11 px-3 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 text-xs font-mono text-white shadow-inner"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="" className="bg-zinc-900">
                            {loadingUsers ? "Loading..." : "Select a user to add"}
                        </option>
                        {availableUsers.map((u) => (
                            <option key={u._id} value={u._id} className="bg-zinc-900">{u.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleAddMember}
                        disabled={busy}
                        className="h-11 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 flex items-center gap-1.5 text-xs font-mono font-bold shrink-0 transition-all shadow-inner disabled:opacity-60 cursor-pointer"
                    >
                        <LuUserPlus size={14} />
                        Add
                    </button>
                </div>

                {/* Members List */}
                <div className="mt-5 space-y-2 max-h-72 overflow-y-auto scrollbar-hide pr-1">

                    {/* Lead */}
                    {project.projectLead && (
                        <div className="flex items-center justify-between bg-zinc-900/60 border border-cyan-500/20 rounded-2xl p-3 shadow-inner">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                    <LuCrown className="text-cyan-400 text-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-mono font-bold text-white truncate">{project.projectLead.name}</p>
                                    <p className="text-[10px] font-mono text-cyan-400">Project Lead</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members */}
                    {(project.members || []).map((m) => (
                        <div key={m.user?._id} className="flex items-center justify-between bg-zinc-900/60 border border-white/5 rounded-2xl p-3 shadow-inner">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-[11px] font-mono font-bold text-zinc-300">
                                    {m.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-mono font-bold text-white truncate">{m.user?.name}</p>
                                    <p className="text-[10px] font-mono text-zinc-500">{m.role || "Member"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => handleMakeLead(m.user?._id)}
                                    disabled={busy}
                                    title="Make Project Lead"
                                    className="h-8 w-8 rounded-lg bg-zinc-800/80 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-zinc-400 hover:text-cyan-400 flex items-center justify-center transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    <LuCrown size={13} />
                                </button>
                                <button
                                    onClick={() => handleRemoveMember(m.user?._id)}
                                    disabled={busy}
                                    title="Remove Member"
                                    className="h-8 w-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    <LuUserMinus size={13} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {(!project.members || project.members.length === 0) && (
                        <p className="text-xs font-mono text-zinc-500 text-center py-6">No additional members yet.</p>
                    )}
                </div>

                {busy && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono">
                        <Loader2 size={14} className="animate-spin" />
                        Updating...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMembersModal;