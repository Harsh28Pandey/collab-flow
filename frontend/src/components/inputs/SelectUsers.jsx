import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PRIORITY_DATA } from "../../utils/data.js";
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuUsers, LuCheck } from 'react-icons/lu';
import Model from '../Model';
import AvatarGroup from '../AvatarGroup';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {

    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const getAllUsers = async () => {

        try {

            const response = await axiosInstance.get(
                API_PATHS.USERS.GET_ALL_USERS
            );

            if (response.data?.length > 0) {
                setAllUsers(response.data)
            }

        } catch (error) {

            console.error("Error fetching users: ", error);
        }
    }

    const toggleUserSelection = (userId) => {

        setTempSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        )
    }

    const handleAssign = () => {

        setSelectedUsers(tempSelectedUsers);

        setIsModalOpen(false);
    }

    const selectedUserAvatars = allUsers
        .filter((user) => selectedUsers.includes(user._id))
        .map((user) => ({
            image: user.profileImageUrl || null,
            name: user.name || ""
        }))

    useEffect(() => {

        getAllUsers();

    }, [])

    useEffect(() => {

        setTempSelectedUsers(selectedUsers);

    }, [selectedUsers])

    return (
        <div className='space-y-4 mt-2'>

            {/* Add Members Button */}
            {selectedUserAvatars.length === 0 && (

                <div className="relative group cursor-pointer inline-block w-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                    <button
                        type="button"
                        className='relative w-full h-12 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer text-nowrap'
                        onClick={() => setIsModalOpen(true)}
                    >
                        <LuUsers className='text-cyan-400 text-base stroke-[2.5]' />
                        Add Members
                    </button>
                </div>
            )}

            {/* Selected Users */}
            {selectedUserAvatars.length > 0 && (

                <div
                    className='cursor-pointer inline-block'
                    onClick={() => setIsModalOpen(true)}
                >

                    <AvatarGroup
                        avatars={selectedUserAvatars}
                        maxVisible={3}
                    />

                </div>
            )}

            {/* Modal */}
            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Users"
            >

                <div className='space-y-3 h-[60vh] overflow-y-auto pr-1 custom-side-scroll'>

                    {allUsers.map((user) => {

                        const isSelected =
                            tempSelectedUsers.includes(user._id);

                        return (

                            <div
                                key={user._id}
                                onClick={() =>
                                    toggleUserSelection(user._id)
                                }
                                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl
                                    
                                    ${isSelected
                                        ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                                        : 'border-white/5 hover:border-white/20 bg-zinc-900/60 hover:bg-zinc-900'
                                    }
                                `}
                            >

                                {/* Avatar */}
                                {user.profileImageUrl ? (

                                    <img
                                        src={user.profileImageUrl}
                                        alt={user.name}
                                        className='w-11 h-11 rounded-full object-cover border border-white/10 shrink-0 shadow-sm'
                                    />

                                ) : (

                                    <div className='w-11 h-11 flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white text-xs font-mono font-black rounded-full shrink-0 shadow-sm uppercase'>

                                        {user.name
                                            ? user.name.charAt(0).toUpperCase()
                                            : "?"}

                                    </div>
                                )}

                                {/* User Info */}
                                <div className='flex-1 min-w-0'>

                                    <p className='font-mono font-bold text-xs sm:text-sm text-white truncate tracking-wide'>
                                        {user.name}
                                    </p>

                                    <p className='text-[11px] font-mono text-zinc-400 truncate mt-0.5'>
                                        {user.email}
                                    </p>

                                </div>

                                {/* Selected Check */}
                                <div
                                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shadow-inner
                                        
                                        ${isSelected
                                            ? 'bg-cyan-500 border-cyan-400 text-zinc-950'
                                            : 'border-white/10 bg-zinc-950 text-transparent'
                                        }
                                    `}
                                >

                                    {isSelected && (
                                        <LuCheck
                                            size={14}
                                            className='stroke-[3]'
                                        />
                                    )}

                                </div>

                            </div>
                        )
                    })}
                </div>

                {/* Footer Buttons */}
                <div className='flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-5 mt-4 border-t border-white/5'>

                    <button
                        type="button"
                        className='w-full sm:w-auto h-12 px-6 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer shadow-inner'
                        onClick={() => setIsModalOpen(false)}
                    >
                        Cancel
                    </button>

                    <div className="relative group cursor-pointer w-full sm:w-auto">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                        <button
                            type="button"
                            className='relative w-full sm:w-auto h-12 px-7 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all shadow-lg active:scale-95 cursor-pointer text-nowrap'
                            onClick={handleAssign}
                        >
                            Done
                        </button>
                    </div>

                </div>

            </Model>
        </div>
    )
}

export default SelectUsers;