import React, { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

const SelectDropdown = ({ options = [], value, onChange, placeholder }) => {

    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    }

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className='relative w-full select-none'>
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className='w-full text-xs sm:text-sm font-mono text-white outline-none bg-zinc-950/80 border border-white/10 px-3.5 py-3 rounded-2xl mt-1.5 flex justify-between items-center cursor-pointer shadow-inner hover:border-cyan-400/50 transition-all'
            >
                <span className={selectedOption ? "text-white font-semibold" : "text-zinc-600"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className='ml-2 text-cyan-400'>
                    <LuChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </span>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className='absolute w-full bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl mt-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden'>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className='px-4 py-2.5 text-xs sm:text-sm font-mono text-zinc-300 hover:text-white cursor-pointer hover:bg-cyan-500/10 transition-colors border-b border-white/5 last:border-none'
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SelectDropdown;