import React from 'react';
import moment from 'moment';

const TaskListTable = ({ tableData }) => {

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
            case 'Pending':
                return 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]';
            case 'In Progress':
                return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(56,189,248,0.15)]';
            default:
                return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
        }
    }

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
            case 'Medium':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
            case 'Low':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
            default:
                return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
        }
    }

    if (!tableData || tableData.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-10 text-zinc-500 font-mono text-xs'>
                &gt; No recent operation logs found in buffer.
            </div>
        );
    }

    return (
        <div className='overflow-x-auto w-full custom-side-scroll'>
            <table className='min-w-full text-left border-collapse'>
                <thead>
                    <tr className='bg-zinc-900/60 backdrop-blur-xl border-b border-white/10 text-zinc-400 font-mono text-[11px] uppercase tracking-wider'>
                        <th className='py-3.5 px-5 font-semibold'>Operation Name</th>
                        <th className='py-3.5 px-5 font-semibold'>Status</th>
                        <th className='py-3.5 px-5 font-semibold'>Priority</th>
                        <th className='py-3.5 px-5 font-semibold hidden md:table-cell'>Timestamp</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-white/5 font-sans'>
                    {tableData.map((task) => (
                        <tr
                            key={task._id}
                            className='hover:bg-white/[0.02] transition-colors duration-200 group'
                        >
                            <td className='py-4 px-5 text-zinc-200 text-[13px] font-medium max-w-[280px] truncate'>
                                <span className='group-hover:text-cyan-400 transition-colors'>
                                    {task.title}
                                </span>
                            </td>

                            <td className='py-4 px-5'>
                                <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg inline-flex items-center gap-1.5 ${getStatusBadgeColor(task.status)}`}>
                                    <span className='w-1.5 h-1.5 rounded-full bg-current animate-pulse'></span>
                                    {task.status}
                                </span>
                            </td>

                            <td className='py-4 px-5'>
                                <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg inline-block ${getPriorityBadgeColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </td>

                            <td className='py-4 px-5 text-zinc-400 text-[12px] font-mono text-nowrap hidden md:table-cell'>
                                {task.createdAt ? moment(task.createdAt).format("DD MMM YYYY") : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TaskListTable;