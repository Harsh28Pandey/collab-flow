import { LuLayoutDashboard, LuUsers, LuClipboardCheck, LuSquarePlus, LuLogOut, LuMessageSquare, LuListTodo, LuMegaphone, LuBadgeIndianRupee, LuChartPie, LuClock, LuSettings, LuWallet, LuReceipt, LuHandCoins, LuCreditCard, LuCalendar, LuFolderClosed, LuCircleUser } from "react-icons/lu";

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
        label: "Manage Polls",
        icon: LuListTodo,
        path: "/admin/polls",
    },
    {
        id: "07",
        label: "Expenses",
        icon: LuWallet,
        path: "/admin/expenses",
    },
    {
        id: "08",
        label: "File Manager",
        icon: LuFolderClosed,
        path: "/admin/file-manager"
    },
    {
        id: "09",
        label: "Timesheet",
        icon: LuClock,
        path: "/admin/timesheet"
    },
    {
        id: "10",
        label: "Settings",
        icon: LuSettings,
        path: "/admin/settings"
    },
    {
        id: "11",
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
        label: "My Expenses",
        icon: LuWallet,
        path: "/user/my-expenses",
    },
    {
        id: "06",
        label: "My Timesheets",
        icon: LuClock,
        path: "/user/timesheet",
    },
    {
        id: "07",
        label: "Calendar",
        icon: LuCalendar,
        path: "/user/calendar"
    },
    {
        id: "08",
        label: "Files",
        icon: LuFolderClosed,
        path: "/user/files"
    },
    {
        id: "09",
        label: "Profile Settings",
        icon: LuCircleUser,
        path: "/user/profile-settings"
    },
    {
        id: "10",
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

export const EXPENSE_CATEGORY_DATA = [
    { label: "Food", value: "Food" },
    { label: "Travel", value: "Travel" },
    { label: "Office", value: "Office" },
    { label: "Software", value: "Software" },
    { label: "Hosting", value: "Hosting" },
    { label: "Marketing", value: "Marketing" },
    { label: "Salary", value: "Salary" },
    { label: "Equipment", value: "Equipment" },
    { label: "Utilities", value: "Utilities" },
    { label: "Miscellaneous", value: "Miscellaneous" }
];

export const SPLIT_TYPE_DATA = [
    { label: "Equal", value: "Equal" },
    { label: "Percentage", value: "Percentage" },
    { label: "Exact Amount", value: "Exact Amount" }
];