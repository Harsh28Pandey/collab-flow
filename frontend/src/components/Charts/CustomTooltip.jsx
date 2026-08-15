import React from 'react';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className='bg-zinc-900/90 backdrop-blur-3xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-2xl p-3 border border-white/10 min-w-[130px] z-50'>
                <p className='text-xs font-mono font-bold text-cyan-400 mb-1 tracking-wide'>
                    {payload[0].name || payload[0].payload?.status || payload[0].payload?.priority}
                </p>
                <div className='flex items-center justify-between gap-4'>
                    <span className='text-[11px] font-mono text-zinc-400'>Count:</span>
                    <span className='text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md'>
                        {payload[0].value}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;