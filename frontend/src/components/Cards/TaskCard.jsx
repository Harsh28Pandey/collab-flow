import React from 'react';
import Progress from '../Progress.jsx';
import AvatarGroup from '../AvatarGroup.jsx';
import moment from 'moment';

import {
    LuPaperclip,
    LuArrowRight,
    LuCalendarDays,
    LuCircleCheckBig
} from 'react-icons/lu';

const TaskCard = ({
    title,
    description,
    priority,
    status,
    progress,
    createdAt,
    dueDate,
    assignedTo,
    attachmentCount,
    completedTodoCount,
    todoChecklist,
    onClick,
    index = 0
}) => {

    const accentColors = [
        'border-l-orange-500',
        'border-l-amber-500',
        'border-l-yellow-500',
        'border-l-rose-400',
        'border-l-fuchsia-400'
    ];

    const currentAccentColor = accentColors[index % 5];

    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return 'text-amber-700 bg-amber-50 border border-amber-200';

            case "Completed":
                return 'text-emerald-700 bg-emerald-50 border border-emerald-200';

            default:
                return 'text-slate-700 bg-slate-50 border border-slate-200';
        }
    }

    const getPriorityTagColor = () => {
        switch (priority) {
            case "Low":
                return 'text-emerald-700 bg-emerald-50 border border-emerald-200';

            case "Medium":
                return 'text-amber-700 bg-amber-50 border border-amber-200';

            default:
                return 'text-rose-700 bg-rose-50 border border-rose-200';
        }
    }

    return (
        <div
            onClick={onClick}
            className='group relative w-full bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer'
        >

            <div className='p-4'>

                {/* Header */}
                <div className='flex items-start justify-between gap-1'>

                    <div className='flex flex-wrap items-center gap-1.5'>
                        <div
                            className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${getStatusTagColor()}`}
                        >
                            {status}
                        </div>

                        <div
                            className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${getPriorityTagColor()}`}
                        >
                            {priority} Priority
                        </div>
                    </div>

                    {attachmentCount > 0 && (
                        <div className='flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full shrink-0'>
                            <LuPaperclip className='text-orange-500 text-[11px]' />

                            <span className='text-[10px] font-bold text-orange-700'>
                                {attachmentCount}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title to Progress Vertical Line */}
                <div
                    className={`mt-4 -ml-4 pl-4 border-l-[3px] ${currentAccentColor}`}
                >

                    {/* Title & Description */}
                    <div>

                        <h3 className='text-[14px] sm:text-[15px] font-extrabold text-slate-900 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors duration-300 tracking-tight'>
                            {title}
                        </h3>

                        <p className='text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1.5 line-clamp-2 leading-snug'>
                            {description}
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className='mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-sm'>

                        <div className='flex items-center justify-between gap-2'>

                            <div className='flex items-center gap-2'>

                                <div className='w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center'>
                                    <LuCircleCheckBig className='text-orange-500 text-[14px]' />
                                </div>

                                <div>
                                    <p className='text-[9px] text-slate-500 font-bold uppercase tracking-wider'>
                                        Progress
                                    </p>

                                    <p className='text-[11px] sm:text-[12px] font-extrabold text-slate-800'>
                                        {completedTodoCount} / {todoChecklist.length || 0} Done
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className='text-[15px] font-black text-orange-600'>
                                    {progress}%
                                </p>
                            </div>
                        </div>

                        <div className='mt-2.5'>
                            <Progress progress={progress} status={status} />
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className='grid grid-cols-2 gap-2 mt-4'>

                    <div className='bg-slate-50 border border-slate-100 rounded-2xl p-2.5 shadow-sm'>

                        <div className='flex items-center gap-1.5 mb-1'>
                            <LuCalendarDays className='text-slate-400 text-[11px]' />

                            <label className='text-[9px] text-slate-500 font-bold uppercase tracking-wider'>
                                Start Date
                            </label>
                        </div>

                        <p className='text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-tight'>
                            {moment(createdAt).format("Do MMM YYYY")}
                        </p>
                    </div>

                    <div className='bg-slate-50 border border-slate-100 rounded-2xl p-2.5 shadow-sm'>

                        <div className='flex items-center gap-1.5 mb-1'>
                            <LuCalendarDays className='text-slate-400 text-[11px]' />

                            <label className='text-[9px] text-slate-500 font-bold uppercase tracking-wider'>
                                Due Date
                            </label>
                        </div>

                        <p className='text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-tight'>
                            {moment(dueDate).format("Do MMM YYYY")}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-100'>

                    <AvatarGroup avatars={assignedTo || []} />

                    <button
                        className='flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 border border-orange-400/50 text-white text-[11px] sm:text-[12px] font-bold px-5 py-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(249,115,22,0.25)] hover:shadow-[0_6px_16px_rgba(249,115,22,0.35)] hover:-translate-y-0.5'
                    >
                        View Details
                        <LuArrowRight className='text-[14px]' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskCard;