import React from 'react'

const AuthLayout = ({ children }) => {
    return (
        <div className='min-h-screen flex bg-[#fafaf9] overflow-hidden relative'>

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Ethereal Ambient Warm Glows */}
            <div className='absolute -top-40 -left-40 w-[450px] h-[450px] bg-gradient-to-br from-yellow-200/50 to-orange-100/20 blur-[140px] rounded-full pointer-events-none mix-blend-multiply' />
            <div className='absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-gradient-to-tl from-orange-200/40 to-yellow-100/20 blur-[140px] rounded-full pointer-events-none mix-blend-multiply' />

            {/* Left Section (Form Area) */}
            <div className='w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-8 relative z-10'>

                <div className='w-full max-w-lg'>

                    {/* Logo */}
                    <div className='mb-6'>
                        <h2 className='text-3xl font-extrabold tracking-tight text-slate-900'>
                            Collab{" "}
                            <span className='bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent'>
                                Flow
                            </span>
                        </h2>

                        <p className='text-sm text-slate-500 mt-1.5 font-medium leading-relaxed'>
                            Modern workspace for productive teams
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className='bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]'>
                        {children}
                    </div>

                </div>

            </div>

            {/* Right Section (Branding / Visual Showcase - Perfectly balanced size, dark grid lines, 4 feature cards) */}
            <div className='hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-[#fafaf9] border-l border-slate-200/80 px-10 xl:px-14 py-8'>

                {/* Background Glows */}
                <div className='absolute -top-24 -left-24 w-80 h-80 bg-orange-200/25 rounded-full blur-[140px] pointer-events-none mix-blend-multiply' />
                <div className='absolute -bottom-24 -right-24 w-80 h-80 bg-yellow-200/35 rounded-full blur-[140px] pointer-events-none mix-blend-multiply' />

                {/* Animated Rings */}
                <div className='absolute w-[500px] h-[500px] border border-slate-300/80 rounded-full animate-spin [animation-duration:38s] pointer-events-none' />

                {/* Darker Grid / Check Lines Overlay */}
                <div
                    className='absolute inset-0 opacity-[0.25] pointer-events-none'
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
                        backgroundSize: '36px 36px'
                    }}
                />

                {/* Main Content (Balanced Size & Comfortable Spacing) */}
                <div className='relative z-10 w-full max-w-md flex flex-col items-center justify-center text-center'>

                    {/* Badge */}
                    <div className='inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-slate-200 bg-white/90 backdrop-blur-xl mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'>
                        <div className='w-2 h-2 rounded-full bg-orange-500 animate-pulse' />
                        <span className='text-[11px] tracking-[0.2em] uppercase text-slate-700 font-bold'>
                            Collaboration Workspace
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className='text-3xl xl:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight max-w-md'>
                        Work Faster Together <br />
                        <span className='relative inline-block mt-1'>
                            <span className='absolute inset-0 bg-gradient-to-r from-orange-200 to-yellow-100 blur-xl opacity-60 rounded-full' />
                            <span className='relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent'>
                                With Collab Flow
                            </span>
                        </span>
                    </h1>

                    {/* Description */}
                    <p className='text-slate-500 text-sm leading-relaxed mt-3 max-w-sm font-medium'>
                        Manage projects, coordinate tasks, and streamline your workflows from one unified platform.
                    </p>

                    {/* Feature Cards (2x2 Grid) */}
                    <div className='grid grid-cols-2 gap-3.5 mt-6 w-full'>

                        <div className='bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-2xl p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)]'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center'>
                                    <svg className='w-3.5 h-3.5 text-orange-500' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M17 20h5V4H2v16h5m10 0v-4a3 3 0 00-6 0v4m6 0H8' />
                                    </svg>
                                </div>
                                <h3 className='text-slate-800 text-xs font-bold tracking-wide'>
                                    Collaboration
                                </h3>
                            </div>
                            <p className='text-xs text-slate-500 leading-snug font-medium'>
                                Shared team workspace.
                            </p>
                        </div>

                        <div className='bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-2xl p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)]'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center'>
                                    <svg className='w-3.5 h-3.5 text-orange-500' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' />
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M9 3h6v4H9z' />
                                    </svg>
                                </div>
                                <h3 className='text-slate-800 text-xs font-bold tracking-wide'>
                                    Task Tracking
                                </h3>
                            </div>
                            <p className='text-xs text-slate-500 leading-snug font-medium'>
                                Workflow sync.
                            </p>
                        </div>

                        <div className='bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-2xl p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)]'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center'>
                                    <svg className='w-3.5 h-3.5 text-orange-500' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z' />
                                    </svg>
                                </div>
                                <h3 className='text-slate-800 text-xs font-bold tracking-wide'>
                                    Group Chat
                                </h3>
                            </div>
                            <p className='text-xs text-slate-500 leading-snug font-medium'>
                                Real-time comms.
                            </p>
                        </div>

                        <div className='bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-2xl p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)]'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center'>
                                    <svg className='w-3.5 h-3.5 text-orange-500' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M9 17v-6m4 6V7m4 10v-4' />
                                    </svg>
                                </div>
                                <h3 className='text-slate-800 text-xs font-bold tracking-wide'>
                                    Polls System
                                </h3>
                            </div>
                            <p className='text-xs text-slate-500 leading-snug font-medium'>
                                Fast team decisions.
                            </p>
                        </div>

                    </div>

                    {/* Bottom Info Card */}
                    <div className='mt-6 flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-md w-full'>
                        <div className='flex -space-x-2'>
                            <div className='w-7 h-7 rounded-full border border-white bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
                                A
                            </div>
                            <div className='w-7 h-7 rounded-full border border-white bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
                                H
                            </div>
                            <div className='w-7 h-7 rounded-full border border-white bg-yellow-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
                                D
                            </div>
                        </div>

                        <div className='text-left'>
                            <h4 className='text-xs font-bold text-slate-900 tracking-tight'>
                                Collab Flow Workspace
                            </h4>
                            <p className='text-[10px] text-slate-500 font-medium'>
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