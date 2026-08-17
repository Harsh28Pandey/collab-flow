import React, { useRef, useState } from 'react';
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

const ProfilePhotoSelector = ({ image, setImage, name }) => {

    const inputRef = useRef(null);
    const [previewUrl, setPrevireUrl] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            const preview = URL.createObjectURL(file);
            setPrevireUrl(preview);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPrevireUrl(null);
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };

    const firstLetter = name ? name.charAt(0).toUpperCase() : null;

    return (
        <div className='flex justify-center mb-6 select-none'>
            <input
                type="file"
                accept='image/*'
                ref={inputRef}
                onChange={handleImageChange}
                className='hidden'
            />

            {!image ? (
                <div className='relative group w-20 h-20'>
                    {/* Ambient Glow Ring */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300 pointer-events-none"></div>

                    <div className='absolute inset-0 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-full cursor-pointer shadow-inner overflow-hidden z-10'>
                        {firstLetter ? (
                            <span className='text-2xl font-mono font-black text-cyan-400'>
                                {firstLetter}
                            </span>
                        ) : (
                            <LuUser className='text-3xl text-zinc-400' />
                        )}
                    </div>

                    {/* Upload Button */}
                    <button
                        type='button'
                        className='w-8 h-8 flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 text-cyan-400 border border-white/10 rounded-full absolute -bottom-1 -right-1 cursor-pointer shadow-lg transition-all active:scale-95 z-20'
                        onClick={onChooseFile}
                    >
                        <LuUpload size={13} className="stroke-[2.5]" />
                    </button>
                </div>
            ) : (
                <div className='relative group w-20 h-20'>
                    {/* Ambient Glow Ring */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300 pointer-events-none"></div>

                    <div className='absolute inset-0 z-10'>
                        <img src={previewUrl}
                            alt="profile photo"
                            className='w-full h-full rounded-full object-cover border-2 border-zinc-900 shadow-2xl'
                        />
                    </div>

                    {/* Trash Button */}
                    <button
                        type='button'
                        className='w-8 h-8 flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 text-rose-400 border border-rose-500/30 rounded-full absolute -bottom-1 -right-1 cursor-pointer shadow-lg transition-all active:scale-95 z-20'
                        onClick={handleRemoveImage}
                    >
                        <LuTrash size={13} className="stroke-[2.5]" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePhotoSelector;