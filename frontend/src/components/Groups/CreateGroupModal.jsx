import React, { useEffect, useMemo, useState } from "react";
import {
    X,
    Users,
    Search,
    Check,
    Loader2,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CreateGroupModal = ({ onClose, onSuccess }) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [allUsers, setAllUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [search, setSearch] = useState("");

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [creating, setCreating] = useState(false);

    const [error, setError] = useState("");
    const [toast, setToast] = useState("");

    // FETCH USERS
    const fetchUsers = async () => {

        try {

            setLoadingUsers(true);

            const res = await axiosInstance.get(
                API_PATHS.USERS.GET_ALL_USERS
            );

            setAllUsers(res.data || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // FILTER USERS
    const filteredUsers = useMemo(() => {

        return allUsers.filter((user) =>
            user.name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );

    }, [allUsers, search]);

    // TOGGLE MEMBER
    const toggleMember = (user) => {

        const exists = selectedMembers.find(
            (member) => member._id === user._id
        );

        if (exists) {

            setSelectedMembers((prev) =>
                prev.filter(
                    (member) =>
                        member._id !== user._id
                )
            );

        } else {

            setSelectedMembers((prev) => [
                ...prev,
                user,
            ]);
        }
    };

    // CREATE GROUP
    const createGroup = async () => {

        let errorMsg = "";

        if (!name.trim()) {

            errorMsg = "Group name is required";

        } else if (!description.trim()) {

            errorMsg = "Description is required";

        } else if (
            selectedMembers.length === 0
        ) {

            errorMsg =
                "Please select at least 1 member";
        }

        if (errorMsg) {

            setError(errorMsg);

            return;
        }

        setError("");

        try {

            setCreating(true);

            await axiosInstance.post(
                API_PATHS.GROUPS.CREATE_GROUP,
                {
                    name,
                    description,
                    members:
                        selectedMembers.map(
                            (m) => m._id
                        ),
                }
            );

            setToast(
                "Group created successfully"
            );

            setTimeout(() => {

                setToast("");

                onSuccess();

                onClose();

            }, 1500);

        } catch (error) {

            console.log(error);

            setError(
                error?.response?.data?.message ||
                "Failed to create group"
            );

        } finally {

            setCreating(false);
        }
    };

    return (

        <>
            {/* TOAST */}
            {toast && (

                <div className="fixed top-5 right-5 z-[10000] bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-[slideDown_.3s_ease]">
                    {toast}
                </div>
            )}

            <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto">

                {/* MODAL WRAPPER */}
                <div className="min-h-screen flex items-center justify-center p-3 sm:p-5">

                    {/* MODAL */}
                    <div className="w-full max-w-4xl bg-white rounded-[26px] shadow-2xl overflow-hidden animate-[modalPop_.25s_ease]">

                        {/* HEADER */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

                            <div className="flex items-center gap-3">

                                <div className="h-11 w-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">

                                    <Users
                                        size={22}
                                        className="text-blue-600"
                                    />
                                </div>

                                <div>

                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        Create Group
                                    </h2>

                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Add members to your team
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="cursor-pointer h-10 w-10 rounded-2xl hover:bg-gray-100 transition flex items-center justify-center"
                            >
                                <X
                                    size={20}
                                    className="text-gray-600"
                                />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">

                            {/* LEFT */}
                            <div className="space-y-5">

                                {/* GROUP DETAILS */}
                                <div className="border border-gray-200 rounded-3xl p-4">

                                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                                        Group Details
                                    </h3>

                                    {/* NAME */}
                                    <div className="mb-4">

                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            Group Name
                                        </label>

                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) =>
                                                setName(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter group name"
                                            className="w-full h-11 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    {/* DESCRIPTION */}
                                    <div>

                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            Description
                                        </label>

                                        <textarea
                                            rows={4}
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Write group description..."
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* SELECTED MEMBERS */}
                                <div className="border border-gray-200 rounded-3xl p-4">

                                    <div className="flex items-center justify-between mb-4">

                                        <h3 className="text-base font-semibold text-gray-900">
                                            Selected Members
                                        </h3>

                                        <span className="text-xs text-gray-500">
                                            {
                                                selectedMembers.length
                                            }{" "}
                                            selected
                                        </span>
                                    </div>

                                    <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">

                                        {selectedMembers.length === 0 ? (

                                            <div className="border border-dashed border-gray-300 rounded-2xl py-8 text-center">

                                                <Users
                                                    size={28}
                                                    className="mx-auto text-gray-400 mb-2"
                                                />

                                                <p className="text-sm text-gray-500">
                                                    No members selected
                                                </p>
                                            </div>

                                        ) : (

                                            selectedMembers.map(
                                                (member) => (

                                                    <div
                                                        key={
                                                            member._id
                                                        }
                                                        className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2"
                                                    >

                                                        <div className="flex items-center gap-3">

                                                            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold uppercase">
                                                                {member.name?.charAt(
                                                                    0
                                                                )}
                                                            </div>

                                                            <div>

                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        member.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                toggleMember(
                                                                    member
                                                                )
                                                            }
                                                            className="cursor-pointer h-8 w-8 rounded-xl hover:bg-red-100 text-red-500 flex items-center justify-center"
                                                        >
                                                            <X
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="border border-gray-200 rounded-3xl p-4 flex flex-col">

                                <div className="flex items-center justify-between mb-4">

                                    <div>

                                        <h3 className="text-base font-semibold text-gray-900">
                                            Add Members
                                        </h3>

                                        <p className="text-xs text-gray-500 mt-1">
                                            Search users
                                        </p>
                                    </div>

                                    <div className="h-11 w-11 rounded-2xl bg-green-100 flex items-center justify-center">

                                        <Users
                                            size={20}
                                            className="text-green-600"
                                        />
                                    </div>
                                </div>

                                {/* SEARCH */}
                                <div className="relative mb-4">

                                    <Search
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search users..."
                                        className="w-full h-11 pl-11 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* USERS */}
                                <div className="flex-1 max-h-[430px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">

                                    {loadingUsers ? (

                                        [...Array(5)].map(
                                            (_, index) => (

                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="border border-gray-200 rounded-2xl p-4 animate-pulse"
                                                >
                                                    <div className="flex items-center gap-3">

                                                        <div className="h-10 w-10 rounded-full bg-gray-200" />

                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 w-28 bg-gray-200 rounded-full" />

                                                            <div className="h-2 w-20 bg-gray-200 rounded-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )

                                    ) : filteredUsers.length === 0 ? (

                                        <div className="border border-dashed border-gray-300 rounded-2xl py-10 text-center">

                                            <Search
                                                size={28}
                                                className="mx-auto text-gray-400 mb-2"
                                            />

                                            <p className="text-sm text-gray-500">
                                                No users found
                                            </p>
                                        </div>

                                    ) : (

                                        filteredUsers.map(
                                            (user) => {

                                                const selected =
                                                    selectedMembers.find(
                                                        (
                                                            member
                                                        ) =>
                                                            member._id ===
                                                            user._id
                                                    );

                                                return (

                                                    <button
                                                        key={
                                                            user._id
                                                        }
                                                        onClick={() =>
                                                            toggleMember(
                                                                user
                                                            )
                                                        }
                                                        className={`cursor-pointer w-full border rounded-2xl p-3 transition-all flex items-center justify-between ${selected
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                            }`}
                                                    >

                                                        <div className="flex items-center gap-3">

                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold uppercase">
                                                                {user.name?.charAt(
                                                                    0
                                                                )}
                                                            </div>

                                                            <div className="text-left">

                                                                <h4 className="text-sm font-semibold text-gray-900">
                                                                    {
                                                                        user.name
                                                                    }
                                                                </h4>

                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {
                                                                        user.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`h-6 w-6 rounded-full flex items-center justify-center ${selected
                                                                ? "bg-blue-600 text-white"
                                                                : "border border-gray-300"
                                                                }`}
                                                        >
                                                            {selected && (
                                                                <Check
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            }
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (

                            <div className="px-5 pb-3">

                                <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* FOOTER */}
                        <div className="border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">

                            <button
                                onClick={onClose}
                                className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={createGroup}
                                disabled={creating}
                                className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                            >

                                {creating ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Users size={17} />

                                        Create Group
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ANIMATIONS + SCROLLBAR */}
                <style>
                    {`
                        @keyframes modalPop {
                            from {
                                opacity: 0;
                                transform: scale(0.96);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }

                        @keyframes slideDown {
                            from {
                                opacity: 0;
                                transform: translateY(-20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }

                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }

                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 999px;
                        }

                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}
                </style>
            </div>
        </>
    );
};

export default CreateGroupModal;