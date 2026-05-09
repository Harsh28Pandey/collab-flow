import React from 'react'

const AuthLayout = ({ children }) => {
    return (
        <div className='min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden relative'>

            {/* Background Glow */}
            <div className='absolute -top-40 -left-40 w-[380px] h-[380px] bg-blue-300/20 blur-[120px] rounded-full animate-pulse' />
            <div className='absolute -bottom-40 -right-40 w-[380px] h-[380px] bg-indigo-300/20 blur-[120px] rounded-full animate-pulse [animation-delay:1.2s]' />

            {/* Left Section */}
            <div className='w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-6 relative z-10'>

                <div className='w-full max-w-lg'>

                    {/* Logo */}
                    <div className='mb-6'>
                        <h2 className='text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent'>
                            Collab Flow
                        </h2>

                        <p className='text-sm text-gray-500 mt-2 leading-relaxed'>
                            Modern workspace for productive teams
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className='bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_70px_rgba(59,130,246,0.10)]'>
                        {children}
                    </div>

                </div>

            </div>

            {/* Right Section */}
            <div className='hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 px-10 xl:px-14 py-10'>

                {/* Background Effects */}
                <div className='absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-[140px]' />
                <div className='absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-300/10 rounded-full blur-[140px]' />

                {/* Animated Rings */}
                <div className='absolute w-[540px] h-[540px] border border-white/10 rounded-full animate-spin [animation-duration:38s]' />
                <div className='absolute w-[380px] h-[380px] border border-white/10 rounded-full animate-spin [animation-duration:24s] [animation-direction:reverse]' />

                {/* Grid Overlay */}
                <div
                    className='absolute inset-0 opacity-[0.03]'
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                        backgroundSize: '38px 38px'
                    }}
                />

                {/* Main Content */}
                <div className='relative z-10 w-full max-w-xl flex flex-col items-center justify-center text-center'>

                    {/* Badge */}
                    <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl mb-7 shadow-lg'>
                        <div className='w-2 h-2 rounded-full bg-sky-300 animate-pulse' />

                        <span className='text-[10px] tracking-[0.22em] uppercase text-blue-100 font-semibold'>
                            Collaboration Workspace
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className='text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight max-w-xl'>
                        Work Faster Together <br />

                        <span className='bg-gradient-to-r from-white via-sky-100 to-cyan-100 bg-clip-text text-transparent'>
                            With Collab Flow
                        </span>
                    </h1>

                    {/* Description */}
                    <p className='text-blue-100/90 text-sm xl:text-base leading-relaxed mt-5 max-w-md'>
                        Manage projects, collaborate with teams, communicate instantly,
                        and streamline workflows from one unified platform.
                    </p>

                    {/* Quick Stats */}
                    <div className='flex items-center justify-center gap-5 mt-7 flex-wrap'>

                        <div className='bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 min-w-[120px]'>
                            <h3 className='text-white text-xl font-bold'>
                                Real-Time
                            </h3>

                            <p className='text-[11px] text-blue-100/75 mt-1 uppercase tracking-wide'>
                                Sync Updates
                            </p>
                        </div>

                        <div className='bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 min-w-[120px]'>
                            <h3 className='text-white text-xl font-bold'>
                                Secure
                            </h3>

                            <p className='text-[11px] text-blue-100/75 mt-1 uppercase tracking-wide'>
                                Team Access
                            </p>
                        </div>

                        <div className='bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 min-w-[120px]'>
                            <h3 className='text-white text-xl font-bold'>
                                Smart
                            </h3>

                            <p className='text-[11px] text-blue-100/75 mt-1 uppercase tracking-wide'>
                                Workflow
                            </p>
                        </div>

                    </div>

                    {/* Feature Cards */}
                    <div className='grid grid-cols-2 gap-4 mt-9 w-full max-w-lg'>

                        <div className='group bg-white/10 border border-white/10 backdrop-blur-2xl rounded-2xl px-4 py-4 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'>

                            <div className='flex items-center gap-3 mb-2'>

                                {/* Icon */}
                                <div className='w-8 h-8 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg'>
                                    <svg
                                        className='w-5 h-5 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M17 20h5V4H2v16h5m10 0v-4a3 3 0 00-6 0v4m6 0H8'
                                        />
                                    </svg>
                                </div>

                                <h3 className='text-white text-sm font-semibold tracking-wide'>
                                    Collaboration
                                </h3>

                            </div>

                            <p className='text-xs text-blue-100/75 leading-relaxed'>
                                Shared team workspace.
                            </p>

                        </div>

                        <div className='group bg-white/10 border border-white/10 backdrop-blur-2xl rounded-2xl px-4 py-4 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'>

                            <div className='flex items-center gap-3 mb-2'>

                                <div className='w-8 h-8 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg'>
                                    <svg
                                        className='w-5 h-5 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2'
                                        />
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M9 3h6v4H9z'
                                        />
                                    </svg>
                                </div>

                                <h3 className='text-white text-sm font-semibold tracking-wide'>
                                    Task Tracking
                                </h3>

                            </div>

                            <p className='text-xs text-blue-100/75 leading-relaxed'>
                                Organized project workflow.
                            </p>

                        </div>

                        <div className='group bg-white/10 border border-white/10 backdrop-blur-2xl rounded-2xl px-4 py-4 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'>

                            <div className='flex items-center gap-3 mb-2'>

                                <div className='w-8 h-8 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg'>
                                    <svg
                                        className='w-5 h-5 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z'
                                        />
                                    </svg>
                                </div>

                                <h3 className='text-white text-sm font-semibold tracking-wide'>
                                    Group Chat
                                </h3>

                            </div>

                            <p className='text-xs text-blue-100/75 leading-relaxed'>
                                Real-time communication.
                            </p>

                        </div>

                        <div className='group bg-white/10 border border-white/10 backdrop-blur-2xl rounded-2xl px-4 py-4 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'>

                            <div className='flex items-center gap-3 mb-2'>

                                <div className='w-8 h-8 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg'>
                                    <svg
                                        className='w-5 h-5 text-white'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M9 17v-6m4 6V7m4 10v-4'
                                        />
                                    </svg>
                                </div>

                                <h3 className='text-white text-sm font-semibold tracking-wide'>
                                    Polls System
                                </h3>

                            </div>

                            <p className='text-xs text-blue-100/75 leading-relaxed'>
                                Faster team decisions.
                            </p>

                        </div>

                    </div>

                    {/* Bottom Info */}
                    <div className='mt-8 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg'>

                        <div className='flex -space-x-2'>

                            <div className='w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-md'>
                                A
                            </div>

                            <div className='w-8 h-8 rounded-full border-2 border-white bg-cyan-600 flex items-center justify-center text-white text-xs font-semibold shadow-md'>
                                H
                            </div>

                            <div className='w-8 h-8 rounded-full border-2 border-white bg-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-md'>
                                D
                            </div>

                        </div>

                        <div className='text-left'>
                            <h4 className='text-sm font-semibold text-white'>
                                Collab Flow Workspace
                            </h4>

                            <p className='text-[11px] text-blue-100/75'>
                                Teams, tasks, chats, and polls together.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}

export default AuthLayout