import React from 'react'
import { Trash2 } from 'lucide-react'

const DeleteAlert = ({ onDelete }) => {
    return (
        <div className='w-full'>

            {/* Icon Box with Neon Rose Glow */}
            <div className='relative w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]'>
                <Trash2
                    size={26}
                    className='text-rose-400'
                />
            </div>

            {/* Content */}
            <div className='text-center mt-5'>
                <h2 className='text-xl font-black text-white tracking-tight'>
                    Delete Task
                </h2>

                <p className='text-xs font-mono text-zinc-400 mt-2 leading-relaxed'>
                    This action cannot be undone. All associated buffer logs will be wiped.
                </p>
            </div>

            {/* Action Button */}
            <div className="relative group cursor-pointer mt-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <button
                    type="button"
                    onClick={onDelete}
                    className='relative w-full h-11 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-rose-400 hover:text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 border border-rose-500/30 transition-all duration-300 cursor-pointer active:scale-[0.98]'
                >
                    <Trash2 size={15} />
                    Execute.Delete()
                </button>
            </div>

        </div>
    )
}

export default DeleteAlert;