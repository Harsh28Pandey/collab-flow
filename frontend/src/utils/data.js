import { LuLayoutDashboard, LuUsers, LuClipboardCheck, LuSquarePlus, LuLogOut, LuMessageSquare, LuListTodo } from "react-icons/lu";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Manage Tasks",
        icon: LuClipboardCheck,
        path: "/admin/tasks",
    },
    {
        id: "03",
        label: "Create Task",
        icon: LuSquarePlus,
        path: "/admin/create-task",
    },
    {
        id: "04",
        label: "Team Members",
        icon: LuUsers,
        path: "/admin/users",
    },
    {
        id: "05",
        label: "Manage Groups",
        icon: LuMessageSquare,
        path: "/admin/groups",
    },
    {
        id: "06",
        label: "Create Polls",
        icon: LuListTodo,
        path: "/admin/polls",
    },
    { 
        id: "07",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/user/dashboard",
    },
    {
        id: "02",
        label: "My Tasks",
        icon: LuClipboardCheck,
        path: "/user/tasks",
    },
    {
        id: "03",
        label: "My Groups",
        icon: LuMessageSquare,
        path: "/user/groups",
    },
    {
        id: "04",
        label: "My Polls",
        icon: LuListTodo,
        path: "/user/polls",
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

export const PRIORITY_DATA = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" }
]

export const STATUS_DATA = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" }
]