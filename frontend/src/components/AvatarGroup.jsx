import React from 'react'

const AvatarGroup = ({ avatars = [], maxVisible = 3 }) => {
    return (
        <div className='flex items-center'>
            {avatars.slice(0, maxVisible).map((avatar, index) => {

                const imageUrl = typeof avatar === 'string' ? avatar : avatar?.image;
                const name = typeof avatar === 'object' ? avatar?.name : "";
                const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

                return imageUrl ? (
                    <img
                        key={index}
                        src={imageUrl}
                        alt={`Avatar ${index}`}
                        className='w-9 h-9 rounded-full object-cover border-2 border-zinc-950 bg-zinc-900 -ml-3 first:ml-0 shadow-md'
                    />
                ) : (
                    <div
                        key={index}
                        className='w-9 h-9 flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white text-xs font-mono font-bold rounded-full border-2 border-zinc-950 -ml-3 first:ml-0 shadow-md uppercase'
                    >
                        {firstLetter}
                    </div>
                );
            })}

            {avatars.length > maxVisible && (
                <div className='w-9 h-9 flex items-center justify-center bg-zinc-900 border-2 border-zinc-950 text-cyan-400 text-xs font-mono font-black rounded-full -ml-3 shadow-md z-10'>
                    +{avatars.length - maxVisible}
                </div>
            )}
        </div>
    )
}

export default AvatarGroup;