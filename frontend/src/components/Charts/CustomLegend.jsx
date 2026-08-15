import React from 'react';

const CustomLegend = ({ payload }) => {
    return (
        <div className='flex flex-wrap justify-center items-center gap-3 sm:gap-6 mt-4 px-2'>
            {payload?.map((entry, index) => (
                <div key={`legend-${index}`} className='flex items-center gap-2'>
                    {/* Glowing color dot */}
                    <div
                        className='w-2.5 h-2.5 rounded-full shadow-sm'
                        style={{
                            backgroundColor: entry.color,
                            boxShadow: `0 0 8px ${entry.color}80`
                        }}
                    />
                    <span className='text-[11px] sm:text-xs font-mono font-medium text-zinc-300 tracking-wide'>
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default CustomLegend;