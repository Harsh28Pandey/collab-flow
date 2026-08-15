import React, { useState } from 'react';
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import { LuPaperclip } from 'react-icons/lu';

const AddAttachmentsInput = ({ attachments = [], setAttachments }) => {

    const [option, setOption] = useState("");

    //* function to handle adding an option
    const handleAddOption = () => {
        if (option.trim()) {
            setAttachments([...attachments, option.trim()]);
            setOption("");
        }
    }

    //* function to handle deleting an option
    const handleDeleteOption = (index) => {
        const updatedArr = attachments.filter((_, idx) => idx !== index)
        setAttachments(updatedArr)
    }

    return (
        <div className='w-full'>
            {attachments.map((item, index) => (
                <div
                    key={item}
                    className='flex items-center justify-between bg-zinc-900/80 border border-white/5 px-3.5 py-2.5 rounded-2xl mb-3 mt-2 shadow-inner group'
                >
                    <div className='flex-1 flex items-center gap-3 min-w-0 mr-3'>
                        <LuPaperclip className='text-cyan-400 shrink-0 text-sm' />
                        <p className='text-xs font-mono text-zinc-200 truncate'>{item}</p>
                    </div>

                    <button
                        type="button"
                        className='cursor-pointer w-7 h-7 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 transition-colors'
                        onClick={() => {
                            handleDeleteOption(index)
                        }}
                    >
                        <HiOutlineTrash className='text-base' />
                    </button>
                </div>
            ))}

            <div className='flex items-center gap-3 mt-4'>
                <div className='flex-1 flex items-center gap-3 border border-white/10 rounded-2xl px-3.5 bg-zinc-950/80 shadow-inner focus-within:border-cyan-400 transition-all'>
                    <LuPaperclip className='text-cyan-400 shrink-0 text-sm' />

                    <input
                        type="text"
                        placeholder='Add File Link'
                        value={option}
                        onChange={({ target }) => setOption(target.value)}
                        className='w-full text-xs sm:text-sm font-mono text-white outline-none bg-transparent py-2.5 placeholder:text-zinc-600'
                    />
                </div>

                <div className="relative group cursor-pointer shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                    <button
                        type="button"
                        className='relative h-12 px-6 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95'
                        onClick={handleAddOption}
                    >
                        <HiMiniPlus className='text-base text-cyan-400 stroke-[3]' />
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddAttachmentsInput;