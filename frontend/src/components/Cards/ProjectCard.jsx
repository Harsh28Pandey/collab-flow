import React from 'react';
import Progress from '../Progress.jsx';
import AvatarGroup from '../AvatarGroup.jsx';
import moment from 'moment';

import {
    LuArrowRight,
    LuCalendarDays,
    LuListChecks,
    LuHash,
    LuCrown
} from 'react-icons/lu';

const ProjectCard = ({
    name,
    description,
    projectCode,
    status,
    priority,
    progress,
    totalTasks,
    completedTasks,
    startDate,
    dueDate,
    projectLead,
    members,
    onClick,
    index = 0
}) => {

    const accentColors = [
        'border-l-cyan-500',
        'border-l-violet-500',
        'border-l-emerald-500',
        'border-l-rose-500',
        'border-l-amber-500'
    ];

    const currentAccentColor = accentColors[index % 5];

    const getStatusTagColor = () => {
        switch (status) {
            case "Active":
                return 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(56,189,248,0.15)]';
            case "Completed":
                return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
            case "On Hold":
                return 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
            case "Archived":
                return 'text-zinc-500 bg-zinc-500/10 border border-zinc-500/20';
            default:
                return 'text-violet-400 bg-violet-500/10 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]';
        }
    };

    const getPriorityTagColor = () => {
        switch (priority) {
            case "Low":
                return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
            case "Medium":
                return 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
            case "High":
                return 'text-orange-400 bg-orange-500/10 border border-orange-500/20 shadow-[0_0_10px_rgba(251,146,60,0.15)]';
            default:
                return 'text-rose-400 bg-rose-500/10 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
        }
    };

    const memberAvatars = (members || []).map((m) => ({
        image: m?.user?.profileImageUrl || null,
        name: m?.user?.name || ""
    }));

    return (
        <div
            onClick={onClick}
            className='group relative w-full bg-zinc-950/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(56,189,248,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer select-none'
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className='p-5'>

                {/* Header */}
                <div className='flex items-start justify-between gap-1'>

                    <div className='flex flex-wrap items-center gap-1.5'>
                        <div className={`text-[9px] sm:text-[10px] font-mono font-bold px-2.5 py-1 rounded-full tracking-wider uppercase ${getStatusTagColor()}`}>
                            {status}
                        </div>

                        <div className={`text-[9px] sm:text-[10px] font-mono font-bold px-2.5 py-1 rounded-full tracking-wider uppercase ${getPriorityTagColor()}`}>
                            {priority}
                        </div>
                    </div>

                    {projectCode && (
                        <div className='flex items-center gap-1.5 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-full shrink-0 shadow-inner'>
                            <LuHash className='text-cyan-400 text-[11px]' />
                            <span className='text-[10px] font-mono font-bold text-cyan-300'>
                                {projectCode}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title to Progress Vertical Line */}
                <div className={`mt-4 -ml-5 pl-4 border-l-[3px] ${currentAccentColor}`}>

                    <div>
                        <h3 className='text-[14px] sm:text-[15px] font-bold text-white line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors duration-300 tracking-tight'>
                            {name}
                        </h3>

                        <p className='text-[11px] sm:text-[12px] text-zinc-400 font-medium mt-1.5 line-clamp-2 leading-relaxed'>
                            {description || "No description provided."}
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className='mt-4 bg-zinc-900/60 border border-white/5 rounded-2xl p-3 shadow-inner'>

                        <div className='flex items-center justify-between gap-2'>

                            <div className='flex items-center gap-2.5'>
                                <div className='w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 shadow-sm flex items-center justify-center text-cyan-400'>
                                    <LuListChecks className='text-[14px]' />
                                </div>

                                <div>
                                    <p className='text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider'>
                                        Tasks
                                    </p>
                                    <p className='text-[11px] sm:text-[12px] font-mono font-bold text-zinc-200'>
                                        {completedTasks || 0} / {totalTasks || 0} Done
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className='text-[14px] font-mono font-black text-cyan-400'>
                                    {progress || 0}%
                                </p>
                            </div>
                        </div>

                        <div className='mt-2.5'>
                            <Progress progress={progress || 0} status={status === "Completed" ? "Completed" : "In Progress"} />
                        </div>
                    </div>
                </div>

                {/* Lead + Dates */}
                <div className='grid grid-cols-2 gap-2.5 mt-4'>

                    <div className='bg-zinc-900/60 border border-white/5 rounded-2xl p-2.5 shadow-inner'>
                        <div className='flex items-center gap-1.5 mb-1'>
                            <LuCrown className='text-zinc-500 text-[11px]' />
                            <label className='text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider'>
                                Lead
                            </label>
                        </div>
                        <p className='text-[10px] sm:text-[11px] font-mono font-semibold text-zinc-300 tracking-tight truncate'>
                            {projectLead?.name || "Unassigned"}
                        </p>
                    </div>

                    <div className='bg-zinc-900/60 border border-white/5 rounded-2xl p-2.5 shadow-inner'>
                        <div className='flex items-center gap-1.5 mb-1'>
                            <LuCalendarDays className='text-zinc-500 text-[11px]' />
                            <label className='text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider'>
                                Due Date
                            </label>
                        </div>
                        <p className='text-[10px] sm:text-[11px] font-mono font-semibold text-zinc-300 tracking-tight'>
                            {dueDate ? moment(dueDate).format("DD MMM YYYY") : "—"}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between gap-2 mt-4 pt-4 border-t border-white/5'>

                    <AvatarGroup avatars={memberAvatars} />

                    <div className="relative group/btn cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-40 group-hover/btn:opacity-100 transition duration-300"></div>
                        <button
                            className='relative flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-white text-[11px] sm:text-[12px] font-mono font-bold px-4 py-2 rounded-full transition-all duration-300 cursor-pointer active:scale-95 shadow-lg'
                        >
                            View Details
                            <LuArrowRight className='text-[13px] text-cyan-400' />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectCard;