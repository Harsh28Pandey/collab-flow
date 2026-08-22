import {
    LuLayoutDashboard, LuUsers, LuClipboardCheck, LuSquarePlus, LuLogOut, LuMessageSquare, LuListTodo, LuMegaphone, LuBadgeIndianRupee, LuChartPie, LuClock, LuSettings, LuWallet, LuReceipt, LuHandCoins, LuCreditCard, LuCalendar, LuFolderClosed, LuCircleUser, LuUmbrella, LuCalendarCheck, LuVideo, LuFolderKanban, LuChartNoAxesCombined,
    LuSparkles
} from "react-icons/lu";

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
        label: "Manage Projects",
        icon: LuFolderKanban,
        path: "/admin/projects",
    },
    {
        id: "04",
        label: "Create Task",
        icon: LuSquarePlus,
        path: "/admin/create-task",
    },
    {
        id: "05",
        label: "Team Members",
        icon: LuUsers,
        path: "/admin/users",
    },
    {
        id: "06",
        label: "Manage Groups",
        icon: LuMessageSquare,
        path: "/admin/groups",
    },
    {
        id: "07",
        label: "Manage Polls",
        icon: LuListTodo,
        path: "/admin/polls",
    },
    // {
    //     id: "07",
    //     label: "Manage Expenses",
    //     icon: LuReceipt,
    //     path: "/admin/manage-expenses",
    // },
    {
        id: "08",
        label: "Expenses",
        icon: LuWallet,
        path: "/admin/expenses",
    },
    {
        id: "09",
        label: "Manage Holidays",
        icon: LuCalendarCheck,
        path: "/admin/holidays",
    },
    {
        id: "10",
        label: "File Manager",
        icon: LuFolderClosed,
        path: "/admin/file-manager"
    },
    {
        id: "11",
        label: "Meeting Controls",
        icon: LuVideo,
        path: "/admin/meeting-controls",
    },
    {
        id: "12",
        label: "Calendar",
        icon: LuCalendar,
        path: "/admin/calendar"
    },
    {
        id: "13",
        label: "Timesheet",
        icon: LuClock,
        path: "/admin/timesheet"
    },
    {
        id: "14",
        label: "Insights",
        icon: LuChartNoAxesCombined,
        path: "/admin/insights"
    },
    {
        id: "15",
        label: "Collab AI",
        icon: LuSparkles,
        path: "/admin/collab-ai"
    },
    {
        id: "16",
        label: "Settings",
        icon: LuSettings,
        path: "/admin/settings"
    },
    {
        id: "17",
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
        label: "My Projects",
        icon: LuFolderKanban,
        path: "/user/projects",
    },
    {
        id: "04",
        label: "My Groups",
        icon: LuMessageSquare,
        path: "/user/groups",
    },
    {
        id: "05",
        label: "My Polls",
        icon: LuListTodo,
        path: "/user/polls",
    },
    {
        id: "06",
        label: "Holidays",
        icon: LuUmbrella,
        path: "/user/holidays",
    },
    {
        id: "07",
        label: "My Timesheets",
        icon: LuClock,
        path: "/user/timesheet",
    },
    {
        id: "08",
        label: "Calendar",
        icon: LuCalendar,
        path: "/user/calendar"
    },
    {
        id: "09",
        label: "My Meetings",
        icon: LuVideo,
        path: "/user/meetings",
    },
    {
        id: "10",
        label: "Files",
        icon: LuFolderClosed,
        path: "/user/files"
    },
    {
        id: "11",
        label: "Insights",
        icon: LuChartNoAxesCombined,
        path: "/user/insights"
    },
    {
        id: "12",
        label: "Collab AI",
        icon: LuSparkles,
        path: "/user/collab-ai"
    },
    {
        id: "13",
        label: "Profile Settings",
        icon: LuCircleUser,
        path: "/user/profile-settings"
    },
    {
        id: "14",
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