import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-[#fafaf9] flex items-center justify-center px-4 relative overflow-hidden'>

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Ethereal Ambient Warm Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-yellow-200/40 to-orange-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-orange-200/30 to-yellow-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />

            <div className='flex flex-col items-center justify-center text-center max-w-lg w-full relative z-10'>

                {/* Logo */}
                <div
                    onClick={() => navigate('/')}
                    className='flex items-center gap-2 mb-10 cursor-pointer group'
                >
                    <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform'>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3 9L9 3L15 9L9 15L3 9Z" fill="white" fillOpacity="0.9" />
                            <path d="M9 3L15 9L9 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className='text-lg font-extrabold text-slate-900 tracking-tight'>
                        Collab<span className='bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent'>Flow</span>
                    </span>
                </div>

                {/* 404 number */}
                <div className='relative mb-6'>
                    <h1 className='text-[120px] sm:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 leading-none select-none drop-shadow-sm'>
                        404
                    </h1>
                    {/* Decorative dots */}
                    <div className='absolute top-4 right-0 w-4 h-4 rounded-full bg-orange-200 opacity-60' />
                    <div className='absolute bottom-4 left-2 w-3 h-3 rounded-full bg-yellow-300 opacity-50' />
                </div>

                {/* Illustration */}
                <div className='w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 shadow-sm'>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="14" stroke="#FED7AA" strokeWidth="2" />
                        <path d="M14 20h12M20 14v12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="20" cy="20" r="3" fill="#F97316" />
                        <path d="M20 8v2M20 30v2M8 20h2M30 20h2" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Text */}
                <h2 className='text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight'>
                    Page Not Found
                </h2>
                <p className='text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-8 max-w-sm'>
                    Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                {/* Buttons */}
                <div className='flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto'>
                    <button
                        onClick={() => navigate(-1)}
                        className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md text-slate-700 text-sm font-semibold hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer shadow-sm'
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-white text-sm font-bold shadow-[0_8px_24px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer'
                    >
                        <Home size={16} />
                        Go to Home
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NotFound;