import React from 'react'

const InfoCard = ({ icon, label, value, color }) => {
    return (
        <div className='flex items-center gap-3'>
            {/* Color Indicator Pill */}
            <div className={`w-2 md:w-2 h-3 md:h-5 ${color} rounded-full`} />

            {/* Text colors updated for dark background visibility */}
            <p className='text-xs md:text-[14px] text-zinc-400'>
                <span className='text-sm md:text-[15px] text-white font-semibold mr-1'>
                    {value}
                </span>
                {label}
            </p>
        </div>
    )
}

export default InfoCard;