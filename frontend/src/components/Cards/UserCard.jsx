import React from 'react'
import {
    LuClock3,
    LuLoader,
    LuCheckCheck
} from "react-icons/lu";

const UserCard = ({ userInfo }) => {

    const getInitial = (name) => {
        return name
            ? name.trim().charAt(0).toUpperCase()
            : "?";
    };

    return (

        <div className='group relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-white/10 hover:border-cyan-500/40 rounded-[2rem] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(56,189,248,0.15)] transition-all duration-300 cursor-pointer select-none'>

            {/* Ambient Glow Orb */}
            <div className='absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none'></div>

            {/* Header */}
            <div className='relative flex items-center gap-3.5 min-w-0'>

                {/* Profile */}
                <div className='relative flex-shrink-0'>

                    {userInfo?.profileImageUrl ? (

                        <img
                            src={userInfo?.profileImageUrl}
                            alt="profile"
                            className='w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-md group-hover:border-cyan-500/50 transition-colors'
                        />

                    ) : (

                        <div className='w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md border border-white/10 uppercase font-mono'>
                            {getInitial(userInfo?.name)}
                        </div>

                    )}

                    {/* Online Dot Beacon */}
                    <div className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]'></div>

                </div>

                {/* User Info */}
                <div className='min-w-0 flex-1'>

                    <h3 className='text-sm font-bold text-white truncate tracking-tight group-hover:text-cyan-400 transition-colors'>
                        {userInfo?.name}
                    </h3>

                    <p className='text-[11px] text-zinc-400 font-mono truncate mt-0.5'>
                        {userInfo?.email}
                    </p>

                    <div className='mt-2 inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-inner'>
                        <span className='w-1 h-1 rounded-full bg-cyan-400 animate-pulse'></span>
                        Team Member
                    </div>

                </div>

            </div>

            {/* Divider */}
            <div className='h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3.5'></div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-2'>

                <StatCard
                    label="Pending"
                    count={userInfo?.pendingTasks || 0}
                    icon={<LuClock3 />}
                    bg="bg-purple-500/10"
                    text="text-purple-400"
                    border="border-purple-500/20"
                />

                <StatCard
                    label="Progress"
                    count={userInfo?.inProgressTasks || 0}
                    icon={<LuLoader />}
                    bg="bg-cyan-500/10"
                    text="text-cyan-400"
                    border="border-cyan-500/20"
                />

                <StatCard
                    label="Done"
                    count={userInfo?.completedTasks || 0}
                    icon={<LuCheckCheck />}
                    bg="bg-emerald-500/10"
                    text="text-emerald-400"
                    border="border-emerald-500/20"
                />

            </div>

        </div>
    )
}

export default UserCard;

// ─────────────────────────────────────────────

const StatCard = ({
    label,
    count,
    icon,
    bg,
    text,
    border
}) => {

    return (

        <div
            className={`${bg} border ${border} rounded-2xl p-2.5 text-center transition-all duration-300 hover:scale-[1.02] shadow-inner backdrop-blur-md`}
        >

            <div className={`flex justify-center text-sm mb-1 ${text}`}>
                {icon}
            </div>

            <h4 className={`text-base font-mono font-black ${text} tracking-tight drop-shadow-sm`}>
                {count}
            </h4>

            <p className='text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider truncate mt-0.5'>
                {label}
            </p>

        </div>
    )
}