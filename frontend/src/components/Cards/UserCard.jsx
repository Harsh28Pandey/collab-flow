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

        <div className='group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:border-blue-300 rounded-3xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer'>

            {/* Glow */}

            <div className='absolute top-0 right-0 w-20 h-20 bg-blue-100/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500'></div>

            {/* Header */}

            <div className='relative flex items-center gap-3 min-w-0'>

                {/* Profile */}

                <div className='relative flex-shrink-0'>

                    {userInfo?.profileImageUrl ? (

                        <img
                            src={userInfo?.profileImageUrl}
                            alt="profile"
                            className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm'
                        />

                    ) : (

                        <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-sm font-bold shadow-sm border-2 border-white'>
                            {getInitial(userInfo?.name)}
                        </div>

                    )}

                    {/* Online Dot */}

                    <div className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white'></div>

                </div>

                {/* User Info */}

                <div className='min-w-0 flex-1'>

                    <h3 className='text-sm font-bold text-gray-900 truncate'>
                        {userInfo?.name}
                    </h3>

                    <p className='text-[11px] text-gray-600 truncate mt-0.5'>
                        {userInfo?.email}
                    </p>

                    <div className='mt-1.5 inline-flex items-center bg-blue-100 text-blue-700 text-[9px] font-semibold px-2 py-0.5 rounded-full'>
                        Team Member
                    </div>

                </div>

            </div>

            {/* Divider */}

            <div className='h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent my-3'></div>

            {/* Stats */}

            <div className='grid grid-cols-3 gap-2'>

                <StatCard
                    label="Pending"
                    count={userInfo?.pendingTasks || 0}
                    icon={<LuClock3 />}
                    bg="from-violet-50 to-violet-100"
                    text="text-violet-700"
                    border="border-violet-200"
                />

                <StatCard
                    label="Progress"
                    count={userInfo?.inProgressTasks || 0}
                    icon={<LuLoader />}
                    bg="from-sky-50 to-sky-100"
                    text="text-sky-700"
                    border="border-sky-200"
                />

                <StatCard
                    label="Done"
                    count={userInfo?.completedTasks || 0}
                    icon={<LuCheckCheck />}
                    bg="from-emerald-50 to-emerald-100"
                    text="text-emerald-700"
                    border="border-emerald-200"
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
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-2 text-center transition-all duration-300 hover:scale-[1.02]`}
        >

            <div className={`flex justify-center text-sm mb-0.5 ${text}`}>
                {icon}
            </div>

            <h4 className={`text-base font-bold ${text}`}>
                {count}
            </h4>

            <p className='text-[9px] font-semibold text-gray-600 truncate'>
                {label}
            </p>

        </div>
    )
}