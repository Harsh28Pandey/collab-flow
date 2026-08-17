import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useNavigate } from "react-router-dom";
import { LuPlus, LuSearch, LuBriefcase, LuTrash2, LuEye } from 'react-icons/lu';
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import moment from "moment";
import AvatarGroup from '../../components/AvatarGroup.jsx';

const ManageProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // Fetch projects using your API
        const fetchProjects = async () => {
            try {
                // Placeholder API call - update with actual
                const res = await axiosInstance.get(API_PATHS.PROJECTS?.GET_ALL || '/api/projects');
                setProjects(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            'Planning': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'Active': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            'On Hold': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Archived': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        };
        return colors[status] || colors['Planning'];
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-emerald-500', 'Medium': 'bg-amber-500', 'High': 'bg-rose-500', 'Urgent': 'bg-red-600 animate-pulse'
        };
        return colors[priority] || colors['Medium'];
    };

    const filteredProjects = projects.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout activeMenu="Manage Projects">
            <div className="py-2 space-y-6">
                
                {/* Header Bento Card */}
                <div className="relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row justify-between items-center gap-5 z-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <LuBriefcase className="text-purple-400" size={20} />
                            </div>
                            Manage Projects
                        </h1>
                        <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-2">Create, track, and manage all enterprise projects and teams.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className='relative flex-1 md:w-64'>
                            <LuSearch size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 z-10' />
                            <input type='text' placeholder='Search projects...' value={search} onChange={(e) => setSearch(e.target.value)}
                                className='w-full h-11 pl-11 pr-4 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-md focus:ring-2 focus:ring-cyan-500/50 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 outline-none transition-all shadow-inner' />
                        </div>
                        <button onClick={() => navigate('/admin/create-project')}
                            className='h-11 px-5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-zinc-950 flex items-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 whitespace-nowrap'
                        >
                            <LuPlus size={16} className="stroke-[3]" /> New Project
                        </button>
                    </div>
                </div>

                {/* Data Table Bento Box */}
                <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden relative'>
                    <div className='w-full overflow-x-auto'>
                        <table className='w-full text-left border-collapse whitespace-nowrap'>
                            <thead>
                                <tr className='border-b border-white/5'>
                                    <th className='pb-4 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Project</th>
                                    <th className='pb-4 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Lead & Team</th>
                                    <th className='pb-4 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Status</th>
                                    <th className='pb-4 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Progress</th>
                                    <th className='pb-4 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider'>Deadline</th>
                                    <th className='pb-4 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider text-right'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-10 text-zinc-500 font-mono text-sm">Loading projects...</td></tr>
                                ) : filteredProjects.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-10 text-zinc-500 font-mono text-sm">No projects found. Create one to get started.</td></tr>
                                ) : (
                                    filteredProjects.map((proj) => (
                                        <tr key={proj._id} className='border-b border-white/5 hover:bg-zinc-900/30 transition-colors group'>
                                            <td className='py-4 px-4'>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(proj.priority)} shadow-[0_0_8px_currentColor]`}></div>
                                                    <div>
                                                        <p className='text-sm font-mono font-bold text-white'>{proj.name}</p>
                                                        <p className='text-[10px] font-mono text-zinc-500'>{proj.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-4 px-4'>
                                                <div className="flex items-center gap-2">
                                                    {proj.projectLead && <img src={proj.projectLead.profileImageUrl || '/default-avatar.png'} className="w-7 h-7 rounded-lg border border-white/10" alt="Lead" title="Project Lead" />}
                                                    <div className="h-4 w-px bg-white/10 mx-1"></div>
                                                    <AvatarGroup avatars={proj.teamMembers?.map(m => ({ image: m.profileImageUrl, name: m.name }))} maxVisible={3} size="sm" />
                                                </div>
                                            </td>
                                            <td className='py-4 px-4'>
                                                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(proj.status)}`}>
                                                    {proj.status}
                                                </span>
                                            </td>
                                            <td className='py-4 px-4'>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-400" style={{ width: `${proj.progress || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-zinc-400">{proj.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className='py-4 px-4 text-xs font-mono text-zinc-400'>
                                                {moment(proj.dueDate).format("DD MMM YYYY")}
                                            </td>
                                            <td className='py-4 px-4 text-right'>
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => navigate(`/admin/project/${proj._id}`)} className="p-2 bg-zinc-900 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/30 rounded-lg transition-colors">
                                                        <LuEye size={14} />
                                                    </button>
                                                    <button className="p-2 bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 rounded-lg transition-colors">
                                                        <LuTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageProjects;