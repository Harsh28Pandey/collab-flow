import React from 'react'

const Progress = ({ progress, status }) => {

    const getColor = () => {
        switch (status) {
            case "In Progress":
                return "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_12px_rgba(56,189,248,0.5)]";
            case "Completed":
                return 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
            default:
                return 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-[0_0_12px_rgba(168,85,247,0.5)]';
        }
    }

    return (
        <div className='w-full bg-zinc-900/90 rounded-full h-2 p-0.5 border border-white/5 shadow-inner overflow-hidden'>
            <div
                className={`${getColor()} h-full rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            ></div>
        </div>
    )
}

export default Progress;