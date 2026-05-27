import React, { useEffect, useState } from 'react'
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

                <button
                    className='card-btn cursor-pointer'
                    onClick={() => setIsModalOpen(true)}
                >

                    <LuUsers className='text-sm' />

                    Add Members

                </button>
            )}

            {/* Selected Users */}
            {selectedUserAvatars.length > 0 && (

                <div
                    className='cursor-pointer'
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

                <div className='space-y-3 h-[60vh] overflow-y-auto pr-1'>

                    {allUsers.map((user) => {

                        const isSelected =
                            tempSelectedUsers.includes(user._id);

                        return (

                            <div
                                key={user._id}
                                onClick={() =>
                                    toggleUserSelection(user._id)
                                }
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer
                                    
                                    ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }
                                `}
                            >

                                {/* Avatar */}
                                {user.profileImageUrl ? (

                                    <img
                                        src={user.profileImageUrl}
                                        alt={user.name}
                                        className='w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0'
                                    />

                                ) : (

                                    <div className='w-11 h-11 flex items-center justify-center bg-primary text-white text-sm font-bold rounded-full shrink-0'>

                                        {user.name
                                            ? user.name.charAt(0).toUpperCase()
                                            : "?"}

                                    </div>
                                )}

                                {/* User Info */}
                                <div className='flex-1 min-w-0'>

                                    <p className='font-semibold text-sm text-gray-900 truncate'>
                                        {user.name}
                                    </p>

                                    <p className='text-xs text-gray-500 truncate'>
                                        {user.email}
                                    </p>

                                </div>

                                {/* Selected Check */}
                                <div
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all
                                        
                                        ${isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-300 bg-white'
                                        }
                                    `}
                                >

                                    {isSelected && (
                                        <LuCheck
                                            size={14}
                                            className='text-white'
                                        />
                                    )}

                                </div>

                            </div>
                        )
                    })}
                </div>

                {/* Footer Buttons */}
                <div className='flex justify-end gap-3 pt-5'>

                    <button
                        className='card-btn cursor-pointer'
                        onClick={() => setIsModalOpen(false)}
                    >
                        Cancel
                    </button>

                    <button
                        className='card-btn-fill cursor-pointer'
                        onClick={handleAssign}
                    >
                        Done
                    </button>

                </div>

            </Model>
        </div>
    )
}

export default SelectUsers