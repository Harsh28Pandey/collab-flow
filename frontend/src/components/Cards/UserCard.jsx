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

        <div className='group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:border-blue-300 rounded-[30px] p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer'>

            {/* Top Glow */}

            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-100/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500'></div>

            {/* Header */}

            <div className='relative flex items-start justify-between gap-4'>

                <div className='flex items-center gap-4'>

                    {/* Profile */}

                    <div className='relative'>

                        {userInfo?.profileImageUrl ? (

                            <img
                                src={userInfo?.profileImageUrl}
                                alt="profile"
                                className='w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md'
                            />

                        ) : (

                            <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-xl font-bold shadow-md border-4 border-white'>
                                {getInitial(userInfo?.name)}
                            </div>

                        )}

                        {/* Online Dot */}

                        <div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white'></div>

                    </div>

                    {/* User Info */}

                    <div className='min-w-0'>

                        <h3 className='text-[17px] font-bold text-gray-900 truncate'>
                            {userInfo?.name}
                        </h3>

                        <p className='text-sm text-gray-600 truncate mt-0.5'>
                            {userInfo?.email}
                        </p>

                        <div className='mt-2 inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full'>
                            Team Member
                        </div>

                    </div>

                </div>

            </div>

            {/* Divider */}

            <div className='h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent my-5'></div>

            {/* Stats */}

            <div className='grid grid-cols-3 gap-3'>

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
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-3 text-center transition-all duration-300 hover:scale-[1.03]`}
        >

            <div className={`flex justify-center text-lg mb-1 ${text}`}>
                {icon}
            </div>

            <h4 className={`text-xl font-bold ${text}`}>
                {count}
            </h4>

            <p className='text-[11px] font-semibold text-gray-600 mt-0.5'>
                {label}
            </p>

        </div>
    )
}