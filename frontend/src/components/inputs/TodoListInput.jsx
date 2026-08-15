import React, { useState } from 'react';
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";

const TodoListInput = ({ todoList = [], setTodoList }) => {

    const [option, setOption] = useState("");

    //* function to handle adding an option
    const handleAddOption = () => {
        if (option.trim()) {
            setTodoList([...todoList, option.trim()]);
            setOption("");
        }
    }

    //* function to handle deleting an option
    const handleDeleteOption = (index) => {
        const updatedArr = todoList.filter((_, idx) => idx !== index)
        setTodoList(updatedArr);
    }

    return (
        <div className='w-full'>
            {todoList.map((item, index) => (
                <div
                    key={item + index}
                    className='flex items-center justify-between bg-zinc-900/80 border border-white/5 px-3.5 py-2.5 rounded-2xl mb-3 mt-2 shadow-inner group'
                >
                    <p className='text-xs sm:text-sm font-mono text-zinc-200 flex items-center gap-3 min-w-0 mr-3'>
                        <span className='text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md shrink-0 shadow-inner'>
                            {index < 9 ? `0${index + 1}` : index + 1}
                        </span>
                        <span className='truncate'>{item}</span>
                    </p>

                    <button
                        type="button"
                        className='cursor-pointer w-7 h-7 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 transition-colors shrink-0'
                        onClick={() => {
                            handleDeleteOption(index)
                        }}
                    >
                        <HiOutlineTrash className='text-base' />
                    </button>
                </div>
            ))}

            <div className='flex items-center gap-3 mt-4'>
                <input
                    type="text"
                    placeholder='Enter Task'
                    value={option}
                    onChange={({ target }) => setOption(target.value)}
                    className='w-full h-11 text-xs sm:text-sm font-mono text-white outline-none bg-zinc-950/80 border border-white/10 px-4 rounded-2xl shadow-inner focus:border-cyan-400 transition-all placeholder:text-zinc-600'
                />

                <div className="relative group cursor-pointer shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                    <button
                        type="button"
                        className='relative h-11 px-5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 flex items-center gap-1.5 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer text-nowrap'
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

export default TodoListInput;