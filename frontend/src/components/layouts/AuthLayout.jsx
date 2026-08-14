// src/components/layouts/AuthLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuZap, LuTerminal, LuWorkflow, LuGitMerge, LuCheck } from "react-icons/lu";

const AuthLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen flex bg-zinc-950 text-zinc-100 overflow-hidden relative font-sans'>

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Ambient Orbs (Deep Dark Mode Neon) */}
            <div className='absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none' />
            <div className='absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none' />

            {/* Left Section (Form Area) */}
            <div className='w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-8 relative z-10'>

                <div className='w-full max-w-lg'>

                    {/* Logo (Clickable -> Redirects to Home) */}
                    <div
                        className='mb-6 cursor-pointer inline-block group'
                        onClick={() => navigate('/')}
                    >
                        <h2 className='text-3xl font-extrabold tracking-tight text-white flex items-center gap-1 group-hover:opacity-90 transition-opacity'>
                            Collab{" "}
                            <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500'>
                                Flow
                            </span>
                        </h2>

                        <p className='text-sm text-zinc-400 mt-1.5 font-medium leading-relaxed font-mono'>
                            Secure developer workspace environment
                        </p>
                    </div>

                    {/* Form Container with Bento Glassmorphism */}
                    <div className='bg-zinc-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)]'>
                        {children}
                    </div>

                </div>

            </div>

            {/* Right Section (Branding / Visual Showcase - Dark Bento Grid Theme) */}
            <div className='hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-zinc-950/40 border-l border-white/5 px-10 xl:px-14 py-8'>

                {/* Background Glows */}
                <div className='absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none' />
                <div className='absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none' />

                {/* Animated Rings */}
                <div className='absolute w-[500px] h-[500px] border border-white/5 rounded-full animate-spin [animation-duration:38s] pointer-events-none' />

                {/* Main Content */}
                <div className='relative z-10 w-full max-w-md flex flex-col items-center justify-center text-center'>

                    {/* Badge */}
                    <div className='inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 backdrop-blur-xl mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'>
                        <div className='w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]' />
                        <span className='text-[11px] tracking-[0.2em] uppercase text-cyan-300 font-bold font-mono'>
                            Edge Workspace Studio
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className='text-3xl xl:text-4xl font-black text-white leading-[1.1] tracking-tight max-w-md'>
                        Work Faster Together <br />
                        <span className='relative inline-block mt-1'>
                            <span className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-40 rounded-full' />
                            <span className='relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500'>
                                With Collab Flow
                            </span>
                        </span>
                    </h1>

                    {/* Description */}
                    <p className='text-zinc-400 text-sm leading-relaxed mt-3 max-w-sm font-medium'>
                        Manage projects, coordinate tasks, and streamline workflows with sub-millisecond real-time synchronization.
                    </p>

                    {/* Feature Cards (2x2 Grid with Bento Glassmorphism) */}
                    <div className='grid grid-cols-2 gap-3.5 mt-6 w-full'>

                        <div className='bg-zinc-900/60 border border-white/5 backdrop-blur-xl rounded-2xl p-4 text-left hover:border-cyan-500/30 transition-colors'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400'>
                                    <LuWorkflow size={14} />
                                </div>
                                <h3 className='text-zinc-200 text-xs font-bold tracking-wide'>
                                    Collaboration
                                </h3>
                            </div>
                            <p className='text-xs text-zinc-400 leading-snug font-mono'>
                                Shared real-time team workspace.
                            </p>
                        </div>

                        <div className='bg-zinc-900/60 border border-white/5 backdrop-blur-xl rounded-2xl p-4 text-left hover:border-cyan-500/30 transition-colors'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400'>
                                    <LuTerminal size={14} />
                                </div>
                                <h3 className='text-zinc-200 text-xs font-bold tracking-wide'>
                                    Task Tracking
                                </h3>
                            </div>
                            <p className='text-xs text-zinc-400 leading-snug font-mono'>
                                Workflow sync & pipelines.
                            </p>
                        </div>

                        <div className='bg-zinc-900/60 border border-white/5 backdrop-blur-xl rounded-2xl p-4 text-left hover:border-purple-500/30 transition-colors'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400'>
                                    <LuGitMerge size={14} />
                                </div>
                                <h3 className='text-zinc-200 text-xs font-bold tracking-wide'>
                                    Group Chat
                                </h3>
                            </div>
                            <p className='text-xs text-zinc-400 leading-snug font-mono'>
                                Real-time comms stream.
                            </p>
                        </div>

                        <div className='bg-zinc-900/60 border border-white/5 backdrop-blur-xl rounded-2xl p-4 text-left hover:border-purple-500/30 transition-colors'>
                            <div className='flex items-center gap-2.5 mb-1.5'>
                                <div className='w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400'>
                                    <LuZap size={14} />
                                </div>
                                <h3 className='text-zinc-200 text-xs font-bold tracking-wide'>
                                    Polls System
                                </h3>
                            </div>
                            <p className='text-xs text-zinc-400 leading-snug font-mono'>
                                Fast team decisions.
                            </p>
                        </div>

                    </div>

                    {/* Bottom Info Card */}
                    <div className='mt-6 flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-lg w-full'>
                        <div className='flex -space-x-2'>
                            <div className='w-7 h-7 rounded-full border border-zinc-800 bg-cyan-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
                                A
                            </div>
                            <div className='w-7 h-7 rounded-full border border-zinc-800 bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
                                H
                            </div>
                            <div className='w-7 h-7 rounded-full border border-zinc-800 bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
                                D
                            </div>
                        </div>

                        <div className='text-left'>
                            <h4 className='text-xs font-bold text-white tracking-tight'>
                                Collab Flow Ecosystem
                            </h4>
                            <p className='text-[10px] text-zinc-400 font-mono'>
                                Teams, tasks, chats, and polls together.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default AuthLayout;