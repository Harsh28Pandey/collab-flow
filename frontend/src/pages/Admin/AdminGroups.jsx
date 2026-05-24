import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    RefreshCw,
    Trash2,
    Users,
    ShieldCheck,
    CalendarDays,
    UserPlus,
    X,
    Eye,
    Loader2,
    Pencil,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import CreateGroupModal from "../../components/Groups/CreateGroupModal.jsx";
import UpdateGroupModal from "../../components/Groups/UpdateGroupModal.jsx";

const Skeleton = () => (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 relative overflow-hidden">

        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10" />

        <div className="relative z-0">

            <div className="flex items-start justify-between">

                <div className="space-y-3 w-full">

                    <div className="h-4 w-40 bg-gray-200 rounded-full" />

                    <div className="h-3 w-56 bg-gray-200 rounded-full" />
                </div>

                <div className="h-10 w-10 rounded-2xl bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="h-16 rounded-2xl bg-gray-100" />

                <div className="h-16 rounded-2xl bg-gray-100" />
            </div>

            <div className="h-11 w-full rounded-2xl bg-gray-200 mt-5" />
        </div>
    </div>
);

const ManageGroups = () => {

    const [groups, setGroups] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [openCreateModal, setOpenCreateModal] = useState(false);

    const [openUpdateModal, setOpenUpdateModal] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedGroupId, setSelectedGroupId] = useState(null);

    const [deleting, setDeleting] = useState(false);

    // FETCH GROUPS
    const fetchGroups = async () => {

        try {

            setRefreshing(true);

            const res = await axiosInstance.get(
                API_PATHS.GROUPS.GET_MY_GROUPS
            );

            setGroups(res.data || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

            setRefreshing(false);
        }
    };

    useEffect(() => {

        fetchGroups();

    }, []);

    // FILTER GROUPS
    const filteredGroups = useMemo(() => {

        return groups.filter((group) =>
            group.name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );

    }, [groups, search]);

    // DELETE GROUP
    const deleteGroup = async () => {

        try {

            if (!selectedGroupId) return;

            setDeleting(true);

            await axiosInstance.delete(
                API_PATHS.GROUPS.DELETE_GROUP(
                    selectedGroupId
                )
            );

            setGroups((prev) =>
                prev.filter(
                    (group) =>
                        group._id !== selectedGroupId
                )
            );

            setShowDeleteModal(false);

            setSelectedGroupId(null);

        } catch (error) {

            console.log(error);

        } finally {

            setDeleting(false);
        }
    };

    return (

        <DashboardLayout activeMenu="Manage Groups">

            {/* STYLES */}
            <style>
                {`
                    @keyframes shimmer {
                        100% {
                            transform: translateX(100%);
                        }
                    }

                    @keyframes modalPop {
                        from {
                            opacity: 0;
                            transform: scale(.95);
                        }

                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    .animate-fadeIn {
                        animation: fadeIn .2s ease;
                    }
                `}
            </style>

            {/* HEADER */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">

                <div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Manage Groups
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Create, organize and manage your workspace groups
                    </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                    {/* REFRESH */}
                    <button
                        onClick={fetchGroups}
                        className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm font-medium text-gray-700 shadow-sm"
                    >

                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    {/* CREATE */}
                    <button
                        onClick={() =>
                            setOpenCreateModal(true)
                        }
                        className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all text-white flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-blue-100"
                    >

                        <Plus size={18} />

                        Create Group
                    </button>
                </div>
            </div>

            {/* SEARCH + STATS */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-4 mb-6">

                {/* SEARCH */}
                <div className="relative flex-1">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search groups..."
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                {/* STATS */}
                <div className="hidden xl:grid grid-cols-3 gap-3">

                    {/* TOTAL */}
                    <div className="min-w-[170px] bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-gray-500">
                                    Total Groups
                                </p>

                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    {groups.length}
                                </h3>
                            </div>

                            <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center">

                                <Users
                                    size={20}
                                    className="text-blue-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE */}
                    <div className="min-w-[170px] bg-green-50 border border-green-100 rounded-2xl px-4 py-3">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-gray-500">
                                    Active Teams
                                </p>

                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    {
                                        groups.filter(
                                            (g) =>
                                                g.members?.length > 0
                                        ).length
                                    }
                                </h3>
                            </div>

                            <div className="h-11 w-11 rounded-xl bg-green-100 flex items-center justify-center">

                                <ShieldCheck
                                    size={20}
                                    className="text-green-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* MEMBERS */}
                    <div className="min-w-[170px] bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs text-gray-500">
                                    Active Members
                                </p>

                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    {
                                        groups.reduce(
                                            (acc, curr) =>
                                                acc +
                                                (
                                                    curr.members
                                                        ?.length || 0
                                                ),
                                            0
                                        )
                                    }
                                </h3>
                            </div>

                            <div className="h-11 w-11 rounded-xl bg-purple-100 flex items-center justify-center">

                                <UserPlus
                                    size={20}
                                    className="text-purple-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GROUP LIST */}
            {loading ? (

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <Skeleton key={item} />
                    ))}
                </div>

            ) : filteredGroups.length === 0 ? (

                <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-20 px-5 text-center">

                    <div className="h-20 w-20 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-5">

                        <Users
                            size={36}
                            className="text-gray-400"
                        />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800">
                        No Groups Found
                    </h3>

                    <p className="text-gray-500 text-sm mt-2">
                        Create your first group.
                    </p>

                    <button
                        onClick={() =>
                            setOpenCreateModal(true)
                        }
                        className="cursor-pointer mt-6 h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all text-white inline-flex items-center gap-2"
                    >

                        <Plus size={18} />

                        Create Group
                    </button>
                </div>

            ) : (

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                    {filteredGroups.map((group) => (

                        <div
                            key={group._id}
                            className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                        >

                            {/* TOP */}
                            <div className="flex items-start justify-between gap-3">

                                <div className="flex items-start gap-3 flex-1">

                                    <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">

                                        <Users
                                            size={24}
                                            className="text-blue-600"
                                        />
                                    </div>

                                    <div className="min-w-0">

                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                            {group.name}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {
                                                group.description ||
                                                "No description added"
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* UPDATE ICON */}
                                <button
                                    onClick={() => {

                                        setSelectedGroup(group);

                                        setOpenUpdateModal(true);
                                    }}
                                    className="cursor-pointer h-11 w-11 rounded-2xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center shrink-0"
                                >

                                    <Pencil
                                        size={18}
                                        className="text-blue-600"
                                    />
                                </button>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 gap-3 mt-5">

                                <div className="border border-gray-100 rounded-2xl p-3 bg-gray-50">

                                    <div className="flex items-center gap-2 text-gray-500 text-sm">

                                        <Users size={14} />

                                        Members
                                    </div>

                                    <h4 className="text-xl font-bold text-gray-900 mt-2">
                                        {group.members?.length || 0}
                                    </h4>
                                </div>

                                <div className="border border-gray-100 rounded-2xl p-3 bg-gray-50">

                                    <div className="flex items-center gap-2 text-gray-500 text-sm">

                                        <CalendarDays size={14} />

                                        Created
                                    </div>

                                    <h4 className="text-sm font-semibold text-gray-900 mt-2">

                                        {new Date(
                                            group.createdAt
                                        ).toLocaleDateString()}
                                    </h4>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-3 mt-5">

                                <button className="cursor-pointer flex-1 h-11 rounded-2xl border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm font-medium text-gray-700">

                                    <Eye size={16} />

                                    View
                                </button>

                                <button
                                    onClick={() => {

                                        setSelectedGroupId(
                                            group._id
                                        );

                                        setShowDeleteModal(true);
                                    }}
                                    className="cursor-pointer h-11 w-11 rounded-2xl bg-red-50 hover:bg-red-100 transition flex items-center justify-center text-red-600"
                                >

                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE MODAL */}
            {openCreateModal && (

                <CreateGroupModal
                    onClose={() =>
                        setOpenCreateModal(false)
                    }
                    onSuccess={() => {

                        setOpenCreateModal(false);

                        fetchGroups();
                    }}
                />
            )}

            {/* UPDATE MODAL */}
            {openUpdateModal && selectedGroup && (

                <UpdateGroupModal
                    group={selectedGroup}
                    onClose={() => {

                        setOpenUpdateModal(false);

                        setSelectedGroup(null);
                    }}
                    onSuccess={() => {

                        setOpenUpdateModal(false);

                        setSelectedGroup(null);

                        fetchGroups();
                    }}
                />
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (

                <div
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => {

                        setShowDeleteModal(false);

                        setSelectedGroupId(null);
                    }}
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative animate-[modalPop_.25s_ease]"
                    >

                        {/* CLOSE */}
                        <button
                            onClick={() => {

                                setShowDeleteModal(false);

                                setSelectedGroupId(null);
                            }}
                            className="absolute top-4 right-4 w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        {/* ICON */}
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">

                            <Trash2
                                size={30}
                                className="text-red-500"
                            />
                        </div>

                        {/* TITLE */}
                        <h2 className="text-2xl font-bold text-gray-900 leading-snug">

                            Delete this group?
                        </h2>

                        {/* DESC */}
                        <p className="text-sm text-gray-500 mt-3 leading-relaxed">

                            This action cannot be undone.
                            The group will be permanently removed.
                        </p>

                        {/* ACTIONS */}
                        <div className="flex items-center justify-end gap-3 mt-8">

                            <button
                                onClick={() => {

                                    setShowDeleteModal(false);

                                    setSelectedGroupId(null);
                                }}
                                className="h-11 px-5 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={deleteGroup}
                                disabled={deleting}
                                className="h-11 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                            >

                                {deleting ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />

                                        Delete Group
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageGroups;