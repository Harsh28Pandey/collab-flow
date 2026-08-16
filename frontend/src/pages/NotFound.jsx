// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden'>

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

            {/* Ethereal Ambient Cyan/Blue Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/10 to-blue-500/5 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-blue-500/10 to-cyan-500/5 blur-[130px] rounded-full pointer-events-none" />

            <div className='flex flex-col items-center justify-center text-center max-w-lg w-full relative z-10'>

                {/* Logo */}
                <div
                    onClick={() => navigate('/')}
                    className='flex items-center gap-2.5 mb-10 cursor-pointer group'
                >
                    <div className='w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform'>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3 9L9 3L15 9L9 15L3 9Z" fill="#22d3ee" fillOpacity="0.9" />
                            <path d="M9 3L15 9L9 15" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className='text-xl font-mono font-black text-white tracking-tight'>
                        Collab<span className='bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'>Flow</span>
                    </span>
                </div>

                {/* Main Bento Card Container */}
                <div className="w-full bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden">

                    {/* Top Ambient Glow Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>

                    {/* 404 number */}
                    <div className='relative mb-4'>
                        <h1 className='text-[100px] sm:text-[130px] font-mono font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400 leading-none select-none drop-shadow-[0_10px_30px_rgba(56,189,248,0.3)]'>
                            404
                        </h1>
                        {/* Decorative dots */}
                        <div className='absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-cyan-500/30' />
                        <div className='absolute bottom-2 left-4 w-2.5 h-2.5 rounded-full bg-blue-400/40' />
                    </div>

                    {/* Illustration Icon Box */}
                    <div className='w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner'>
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="14" stroke="rgba(56,189,248,0.3)" strokeWidth="2" />
                            <path d="M14 20h12M20 14v12" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="20" cy="20" r="3" fill="#22d3ee" />
                            <path d="M20 8v2M20 30v2M8 20h2M30 20h2" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Text */}
                    <h2 className='text-xl sm:text-2xl font-mono font-black text-white mb-2 tracking-wide'>
                        Page Not Found
                    </h2>
                    <p className='text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed mb-8 max-w-xs mx-auto'>
                        Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                    </p>

                    {/* Buttons */}
                    <div className='flex flex-col sm:flex-row items-center gap-3 w-full'>
                        <button
                            onClick={() => navigate(-1)}
                            className='cursor-pointer w-full sm:flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-inner active:scale-95'
                        >
                            <ArrowLeft size={16} className="text-cyan-400 stroke-[2.5]" />
                            Go Back
                        </button>

                        <div className="relative group cursor-pointer w-full sm:flex-1">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                            <button
                                onClick={() => navigate('/')}
                                className='relative cursor-pointer w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95'
                            >
                                <Home size={16} className="text-cyan-400 stroke-[2.5]" />
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NotFound;