import React from 'react'
import { Trash2 } from 'lucide-react'

const DeleteAlert = ({ onDelete }) => {
    return (
        <div className='w-full'>

            {/* Icon */}
            <div className='w-16 h-16 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200'>

                <Trash2
                    size={28}
                    className='text-rose-600'
                />

            </div>

            {/* Content */}
            <div className='text-center mt-4'>

                <h2 className='text-xl font-bold text-gray-900'>
                    Delete Task
                </h2>

                <p className='text-sm text-gray-500 mt-2 leading-6'>
                    This action cannot be undone.
                </p>

            </div>

            {/* Button */}
            <button
                type="button"
                onClick={onDelete}
                className='w-full h-11 mt-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98]'
            >

                <Trash2 size={16} />

                Delete Task

            </button>

        </div>
    )
}

export default DeleteAlert