import React from "react";

const Model = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">

            {/* BACKDROP BLUR */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* MODAL BOX */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 z-[10000] max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black text-xl cursor-pointer border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-105"
                    >
                        ✕
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
};

export default Model;



// import React from 'react'

// const Model = ({ children, isOpen, onClose, title }) => {

//     if (!isOpen)
//         return;

//     return (
//         <div className='fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden bg-black/50'>
//             <div className='relative p-4 w-full max-w-2xl max-h-full'>

//                 <div className='relative bg-white rounded-2xl shadow-sm'>

//                     {/* Modal header */}
//                     <div className='flex items-center justify-between p-4 md:p-5 border-b rounded-2xl border-gray-300'>
//                         <h3 className='text-lg font-medium text-gray-900'>
//                             {title}
//                         </h3>

//                         <button
//                             type='button'
//                             className='text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-2xl text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer'
//                             onClick={onClose}
//                         >
//                             <svg
//                                 className='w-3 h-3'
//                                 aria-hidden="true"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill='none'
//                                 viewBox='0 0 14 14'
//                             >
//                                 <path
//                                     stroke='currentColor'
//                                     strokeLinecap='round'
//                                     strokeLinejoin='round'
//                                     strokeWidth="2"
//                                     d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
//                                 />
//                             </svg>
//                         </button>
//                     </div>

//                     {/* Modal body */}
//                     <div className='p-4 md:p-5 space-y-4'>
//                         {children}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Model