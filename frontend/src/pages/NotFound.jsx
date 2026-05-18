import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4'>
            <div className='flex flex-col items-center justify-center text-center max-w-lg w-full'>

                {/* Logo */}
                <div className='flex items-center gap-2 mb-10'>
                    <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-200'>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3 9L9 3L15 9L9 15L3 9Z" fill="white" fillOpacity="0.9" />
                            <path d="M9 3L15 9L9 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className='text-lg font-bold text-gray-900'>
                        Collab<span className='text-blue-600'>Flow</span>
                    </span>
                </div>

                {/* 404 number */}
                <div className='relative mb-6'>
                    <h1 className='text-[120px] sm:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-sky-400 leading-none select-none'>
                        404
                    </h1>
                    {/* Decorative dots */}
                    <div className='absolute top-4 right-0 w-4 h-4 rounded-full bg-blue-200 opacity-60' />
                    <div className='absolute bottom-4 left-2 w-3 h-3 rounded-full bg-sky-300 opacity-50' />
                </div>

                {/* Illustration */}
                <div className='w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6'>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="14" stroke="#BFDBFE" strokeWidth="2" />
                        <path d="M14 20h12M20 14v12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="20" cy="20" r="3" fill="#3B82F6" />
                        <path d="M20 8v2M20 30v2M8 20h2M30 20h2" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Text */}
                <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-3'>
                    Page Not Found
                </h2>
                <p className='text-sm sm:text-base text-gray-500 leading-relaxed mb-8 max-w-sm'>
                    Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                {/* Buttons */}
                <div className='flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto'>
                    <button
                        onClick={() => navigate(-1)}
                        className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 cursor-pointer'
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-sm font-semibold shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer'
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