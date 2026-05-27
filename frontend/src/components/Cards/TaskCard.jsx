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
        'border-l-cyan-500',
        'border-l-violet-500',
        'border-l-emerald-500',
        'border-l-rose-500',
        'border-l-amber-500'
    ];

    const currentAccentColor = accentColors[index % 5];

    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return 'text-cyan-700 bg-cyan-50 border border-cyan-200';

            case "Completed":
                return 'text-lime-700 bg-lime-50 border border-lime-200';

            default:
                return 'text-violet-700 bg-violet-50 border border-violet-200';
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
            className='group relative w-full bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer'
        >

            <div className='p-3'>

                {/* Header */}
                <div className='flex items-start justify-between gap-1'>

                    <div className='flex flex-wrap items-center gap-1'>
                        <div
                            className={`text-[9px] sm:text-[10px] font-semibold px-2 py-1 rounded-full ${getStatusTagColor()}`}
                        >
                            {status}
                        </div>

                        <div
                            className={`text-[9px] sm:text-[10px] font-semibold px-2 py-1 rounded-full ${getPriorityTagColor()}`}
                        >
                            {priority} Priority
                        </div>
                    </div>

                    {attachmentCount > 0 && (
                        <div className='flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full shrink-0'>
                            <LuPaperclip className='text-blue-600 text-[10px]' />

                            <span className='text-[9px] font-semibold text-gray-700'>
                                {attachmentCount}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title to Progress Vertical Line */}
                <div
                    className={`mt-2.5 -ml-3 pl-3 border-l-[3px] ${currentAccentColor}`}
                >

                    {/* Title & Description */}
                    <div>

                        <h3 className='text-[13px] sm:text-[14px] font-bold text-gray-900 line-clamp-2 leading-5 group-hover:text-primary transition-colors'>
                            {title}
                        </h3>

                        <p className='text-[10px] sm:text-[11px] text-gray-600 mt-1 line-clamp-2 leading-4'>
                            {description}
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className='mt-2.5 bg-gray-50 border border-gray-100 rounded-2xl p-2'>

                        <div className='flex items-center justify-between gap-2'>

                            <div className='flex items-center gap-1.5'>

                                <div className='w-7 h-7 rounded-md bg-white border border-gray-100 shadow-sm flex items-center justify-center'>
                                    <LuCircleCheckBig className='text-primary text-xs' />
                                </div>

                                <div>
                                    <p className='text-[8px] text-gray-500 font-medium'>
                                        Progress
                                    </p>

                                    <p className='text-[10px] sm:text-[11px] font-bold text-gray-900'>
                                        {completedTodoCount} / {todoChecklist.length || 0} Done
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className='text-sm font-bold text-primary'>
                                    {progress}%
                                </p>
                            </div>
                        </div>

                        <div className='mt-1.5'>
                            <Progress progress={progress} status={status} />
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className='grid grid-cols-2 gap-1.5 mt-2.5'>

                    <div className='bg-gray-50 border border-gray-100 rounded-2xl p-2'>

                        <div className='flex items-center gap-1 mb-1'>
                            <LuCalendarDays className='text-gray-500 text-[9px]' />

                            <label className='text-[8px] text-gray-500 font-medium'>
                                Start Date
                            </label>
                        </div>

                        <p className='text-[9px] sm:text-[10px] font-semibold text-gray-900'>
                            {moment(createdAt).format("Do MMM YYYY")}
                        </p>
                    </div>

                    <div className='bg-gray-50 border border-gray-100 rounded-2xl p-2'>

                        <div className='flex items-center gap-1 mb-1'>
                            <LuCalendarDays className='text-gray-500 text-[9px]' />

                            <label className='text-[8px] text-gray-500 font-medium'>
                                Due Date
                            </label>
                        </div>

                        <p className='text-[9px] sm:text-[10px] font-semibold text-gray-900'>
                            {moment(dueDate).format("Do MMM YYYY")}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-gray-100'>

                    <AvatarGroup avatars={assignedTo || []} />

                    <button
                        className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white text-[10px] sm:text-[11px] font-semibold px-5 py-2.5 rounded-3xl transition-all duration-300 cursor-pointer active:scale-95 shadow-sm hover:shadow-md'
                    >
                        View Details

                        <LuArrowRight className='text-[13px]' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskCard;