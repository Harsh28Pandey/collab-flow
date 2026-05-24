import React, { useEffect, useMemo, useState } from "react";
import {
    X,
    Users,
    Search,
    Check,
    Loader2,
    UserPlus,
    Save,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const UpdateGroupModal = ({
    onClose,
    onSuccess,
    group,
}) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [allUsers, setAllUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [search, setSearch] = useState("");

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [error, setError] = useState("");

    // PREFILL GROUP DETAILS
    useEffect(() => {

        if (group) {

            setName(group.name || "");

            setDescription(group.description || "");
        }

    }, [group]);

    // FETCH USERS
    const fetchUsers = async () => {

        try {

            setLoadingUsers(true);

            const res = await axiosInstance.get(
                API_PATHS.USERS.GET_ALL_USERS
            );

            const users = res.data || [];

            setAllUsers(users);

            // FIX MEMBERS DATA
            if (
                group &&
                Array.isArray(group.members)
            ) {

                const formattedMembers =
                    group.members.map((member) => {

                        /**
                         * SUPPORTS:
                         * 1. member.user populated
                         * 2. member.user id only
                         * 3. direct member object
                         */

                        let userData = null;

                        // CASE 1
                        if (
                            member?.user &&
                            typeof member.user ===
                            "object"
                        ) {

                            userData =
                                member.user;
                        }

                        // CASE 2
                        else if (
                            member?.user &&
                            typeof member.user ===
                            "string"
                        ) {

                            userData =
                                users.find(
                                    (u) =>
                                        u._id ===
                                        member.user
                                );
                        }

                        // CASE 3
                        else if (
                            member?._id
                        ) {

                            userData = member;
                        }

                        if (!userData) {

                            return null;
                        }

                        return {
                            _id:
                                userData._id,
                            name:
                                userData.name ||
                                "Unknown User",
                            email:
                                userData.email ||
                                "",
                            profileImageUrl:
                                userData.profileImageUrl ||
                                "",
                        };
                    })
                        .filter(Boolean);

                setSelectedMembers(
                    formattedMembers
                );
            }

        } catch (error) {

            console.log(error);

            setError(
                "Failed to load users"
            );

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
                .includes(
                    search.toLowerCase()
                )
        );

    }, [allUsers, search]);

    // CHECK SELECTED
    const isSelected = (userId) => {

        return selectedMembers.some(
            (member) =>
                member._id === userId
        );
    };

    // TOGGLE MEMBER
    const toggleMember = (user) => {

        const exists =
            selectedMembers.find(
                (member) =>
                    member._id === user._id
            );

        if (exists) {

            setSelectedMembers((prev) =>
                prev.filter(
                    (member) =>
                        member._id !==
                        user._id
                )
            );

        } else {

            setSelectedMembers((prev) => [
                ...prev,
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImageUrl:
                        user.profileImageUrl ||
                        "",
                },
            ]);
        }
    };

    // UPDATE GROUP
    const updateGroup = async () => {

        try {

            if (!name.trim()) {

                setError(
                    "Group name is required"
                );

                return;
            }

            setError("");

            setUpdating(true);

            await axiosInstance.put(
                API_PATHS.GROUPS.UPDATE_GROUP(
                    group._id
                ),
                {
                    name,
                    description,
                    members:
                        selectedMembers.map(
                            (member) =>
                                member._id
                        ),
                }
            );

            onSuccess();

        } catch (error) {

            console.log(error);

            setError(
                error?.response?.data
                    ?.message ||
                "Failed to update group"
            );

        } finally {

            setUpdating(false);
        }
    };

    return (

        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto">

            <div className="min-h-screen flex items-center justify-center p-3 sm:p-5">

                <div className="w-full max-w-5xl bg-white rounded-[28px] shadow-2xl overflow-hidden my-6">

                    {/* HEADER */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">

                        <div className="flex items-center gap-4">

                            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">

                                <Users
                                    size={28}
                                    className="text-blue-600"
                                />
                            </div>

                            <div>

                                <h2 className="text-2xl font-bold text-gray-900">
                                    Update Group
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Edit group details and members
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="h-11 w-11 rounded-2xl hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                        >
                            <X
                                size={22}
                                className="text-gray-600"
                            />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="max-h-[75vh] overflow-y-auto">

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 p-4 sm:p-6">

                            {/* LEFT */}
                            <div>

                                {/* GROUP DETAILS */}
                                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5">

                                    <div className="flex items-center justify-between mb-5">

                                        <div>

                                            <h3 className="text-lg font-semibold">
                                                Group Details
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                {
                                                    selectedMembers.length
                                                }{" "}
                                                members selected
                                            </p>
                                        </div>

                                        <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">

                                            <UserPlus
                                                size={22}
                                                className="text-blue-600"
                                            />
                                        </div>
                                    </div>

                                    {/* NAME */}
                                    <div className="mb-5">

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
                                            className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    {/* DESCRIPTION */}
                                    <div>

                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            Description
                                        </label>

                                        <textarea
                                            rows={5}
                                            value={
                                                description
                                            }
                                            onChange={(e) =>
                                                setDescription(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* SELECTED MEMBERS */}
                                <div className="bg-white border border-gray-200 rounded-3xl p-5 mt-5">

                                    <h3 className="text-lg font-semibold mb-4">
                                        Selected Members
                                    </h3>

                                    {selectedMembers.length ===
                                        0 ? (

                                        <div className="border border-dashed border-gray-300 rounded-2xl py-10 text-center">

                                            <Users
                                                size={32}
                                                className="mx-auto text-gray-400 mb-3"
                                            />

                                            <p className="text-sm text-gray-500">
                                                No members selected
                                            </p>
                                        </div>

                                    ) : (

                                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">

                                            {selectedMembers.map(
                                                (
                                                    member
                                                ) => (

                                                    <div
                                                        key={
                                                            member._id
                                                        }
                                                        className="flex items-center justify-between gap-3 border border-gray-200 rounded-2xl p-3 bg-gray-50"
                                                    >

                                                        <div className="flex items-center gap-3 min-w-0 flex-1">

                                                            {/* PROFILE */}
                                                            {member.profileImageUrl ? (

                                                                <img
                                                                    src={
                                                                        member.profileImageUrl
                                                                    }
                                                                    alt={
                                                                        member.name
                                                                    }
                                                                    className="h-12 w-12 rounded-full object-cover shrink-0"
                                                                />

                                                            ) : (

                                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">

                                                                    {member.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()}
                                                                </div>
                                                            )}

                                                            {/* USER INFO */}
                                                            <div className="min-w-0 flex-1">

                                                                <h4 className="text-sm font-semibold text-gray-900 truncate">

                                                                    {
                                                                        member.name
                                                                    }
                                                                </h4>

                                                                <p className="text-xs text-gray-500 truncate">

                                                                    {
                                                                        member.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* REMOVE */}
                                                        <button
                                                            onClick={() =>
                                                                toggleMember(
                                                                    member
                                                                )
                                                            }
                                                            className="h-9 w-9 rounded-xl hover:bg-red-100 text-red-500 flex items-center justify-center cursor-pointer"
                                                        >
                                                            <X
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col">

                                <div className="flex items-center justify-between mb-5">

                                    <div>

                                        <h3 className="text-lg font-semibold">
                                            Update Members
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            Search and manage users
                                        </p>
                                    </div>

                                    <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">

                                        <Users
                                            size={22}
                                            className="text-green-600"
                                        />
                                    </div>
                                </div>

                                {/* SEARCH */}
                                <div className="relative mb-5">

                                    <Search
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Search users..."
                                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* USERS */}
                                <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-1">

                                    {loadingUsers ? (

                                        <div className="flex items-center justify-center py-20">

                                            <Loader2
                                                size={30}
                                                className="animate-spin text-blue-600"
                                            />
                                        </div>

                                    ) : (

                                        filteredUsers.map(
                                            (
                                                user
                                            ) => {

                                                const selected =
                                                    isSelected(
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
                                                        className={`w-full border rounded-2xl p-4 transition-all flex items-center justify-between gap-3 ${selected
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                            }`}
                                                    >

                                                        <div className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer">

                                                            {user.profileImageUrl ? (

                                                                <img
                                                                    src={
                                                                        user.profileImageUrl
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    className="h-12 w-12 rounded-full object-cover shrink-0"
                                                                />

                                                            ) : (

                                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">

                                                                    {user.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()}
                                                                </div>
                                                            )}

                                                            <div className="text-left min-w-0 flex-1">

                                                                <h4 className="text-sm font-semibold text-gray-900 truncate">

                                                                    {
                                                                        user.name
                                                                    }
                                                                </h4>

                                                                <p className="text-xs text-gray-500 truncate">

                                                                    {
                                                                        user.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${selected
                                                                ? "bg-blue-600 text-white"
                                                                : "border border-gray-300"
                                                                }`}
                                                        >

                                                            {selected && (
                                                                <Check
                                                                    size={
                                                                        15
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
                    </div>

                    {/* ERROR */}
                    {error && (

                        <div className="px-5 pb-2">

                            <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-3 text-sm text-red-600">

                                {error}
                            </div>
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="border-t border-gray-100 px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">

                        <button
                            onClick={onClose}
                            className="h-11 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={updateGroup}
                            disabled={updating}
                            className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 cursor-pointer"
                        >

                            {updating ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />

                                    Update Group
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateGroupModal;