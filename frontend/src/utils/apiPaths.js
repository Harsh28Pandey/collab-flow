// export const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",  //* register a new user (admin or member)
        LOGIN: "/api/auth/login",  //* authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile",  //* get logged-in user details
        GET_TEAM_BY_CODE: (teamCode) => `/api/auth/team/${teamCode}`,  //* get team name by team code
        UPDATE_PROFILE: "/api/auth/profile", //* update user profile details
        // PASSWORD ROUTES
        FORGOT_PASSWORD: "/api/auth/forgot-password",  //* send OTP to email for password reset
        VERIFY_OTP: (email) => `/api/auth/verify-otp/${email}`,  //* verify OTP for password reset
        CHANGE_PASSWORD: (email) => `/api/auth/change-password/${email}`,  //* change password after OTP verification
    },

    USERS: {
        GET_ALL_USERS: "/api/users",  //* get all users (admin only)
        GET_USERS_COUNT: "/api/users/count",  //* get total users count (all logged-in users)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`,  //* get user by id
        CREATE_USER: "/api/users",  //* create a new user (admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`,  //* update user details
        DELETE_USER: (userId) => `/api/users/${userId}`,  //* delete a user (admin only)
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data",  //* get dashboard data
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",  //* get user dashboard data
        GET_ALL_TASKS: "/api/tasks",  //* get all tasks (admin: all, user: only assigned tasks)
        GET_TASK_BY_ID: (userId) => `/api/tasks/${userId}`,  //* get task by id
        CREATE_TASK: "/api/tasks",  //* create a new task (admin only)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,  //* update task details
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,  //* delete a task (admin only)
        BULK_DELETE_TASKS: "/api/tasks/bulk-delete",  //* bulk delete tasks (admin only)
        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}`,  //* update task status
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`,  //* update todo checklist
    },

    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks",  //* download all tasks as an excel/pdf report
        EXPORT_USERS: "/api/reports/export/users",  //* download user-task report
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image"
    },

    GROUPS: {
        CREATE_GROUP: "/api/groups",  //* create a new group (admin only)
        GET_MY_GROUPS: "/api/groups",  //* get groups of logged-in user
        GET_SINGLE_GROUP: (groupId) => `/api/groups/${groupId}`,  //* get single group details (admin & members)
        ADD_MEMBER: (groupId) => `/api/groups/${groupId}/members`,  //* add member to group (admin only)
        REMOVE_MEMBER: (groupId, memberId) =>
            `/api/groups/${groupId}/members/${memberId}`,  //* remove member from group (admin only)
        LEAVE_GROUP: (groupId) => `/api/groups/${groupId}/leave`,  //* leave group (admin & members)
        UPDATE_GROUP: (groupId) => `/api/groups/${groupId}`,  //* update group details (admin only)
        JOIN_GROUP: (code) => `/api/groups/join/${code}`,  //* join group via code (admin & members)
        DELETE_GROUP: (groupId) => `/api/groups/${groupId}`,  //* delete a group (admin only)
    },

    MESSAGES: {
        SEND_MESSAGE: "/api/messages",  //* send a message into a particular group (admin & user both)
        GET_MESSAGES: (groupId) => `/api/messages/${groupId}`,  //* get messages (admin & user both)
        DELETE_MESSAGE: (messageId) => `/api/messages/${messageId}`,  //* delete messages from a group 
    },

    POLLS: {
        GET_ALL_POLLS: "/api/polls",  //* get all polls (logged-in users)
        CREATE_POLL: "/api/polls/create",  //* create poll (admin only)
        VOTE_POLL: "/api/polls/vote",  //* vote on poll (logged-in users)
        DELETE_POLL: "/api/polls/delete",  //* delete poll (admin only)

        // GET_POLL_BY_ID: (pollId) => `/api/polls/${pollId}`,  //* optional (future use)
    },

    FILES: {
        UPLOAD_FILE: "/api/files/upload",  //* upload a file to a project
        GET_PROJECT_FILES: (projectId) => `/api/files/project/${projectId}`,  //* get all files of a project
        DELETE_FILE: (fileId) => `/api/files/${fileId}`,  //* delete a file by id
    },

    TIMESHEET: {
        // Dashboard
        GET_ALL: "/api/timesheets",  //* get all timesheets (admin only)
        GET_STATS: "/api/timesheets/stats", //* get timesheet stats (admin only)
        GET_MY_TIMESHEETS: "/api/timesheets/my-timesheets", //* get all approved timesheets (any logged-in user)

        // CRUD
        CREATE: "/api/timesheets",  //* create a new timesheet (admin only, for any employee)
        GET_BY_ID: (timesheetId) => `/api/timesheets/${timesheetId}`,   //* get a single timesheet by id (admin only)
        DELETE: (timesheetId) => `/api/timesheets/${timesheetId}`,  //* delete a timesheet by id (admin only)

        // Actions
        APPROVE: (timesheetId) => `/api/timesheets/approve/${timesheetId}`,  //* approve a timesheet (admin only)
        REJECT: (timesheetId) => `/api/timesheets/reject/${timesheetId}`,  //* reject a timesheet (admin only)

        // Bulk Actions (Future)
        BULK_APPROVE: "/api/timesheets/bulk/approve",  //* bulk approve timesheets (admin only)
        BULK_REJECT: "/api/timesheets/bulk/reject", //* bulk reject timesheets (admin only)
        BULK_DELETE: "/api/timesheets/bulk/delete", //* bulk delete timesheets (admin only)

        // Export (Future)
        EXPORT_CSV: "/api/timesheets/export/csv",   //* export timesheets to CSV (admin only)
        EXPORT_PDF: "/api/timesheets/export/pdf",   //* export timesheets to PDF (admin only)
    },

    // EVENTS
    EVENTS: {
        CREATE: "/api/events",  //* create a new event (admin only)
        GET_ALL: "/api/events",  //* get all events (admin: all, user: only assigned events)
        UPDATE: (id) => `/api/events/${id}`,  //* update event details
        DELETE: (id) => `/api/events/${id}`,  //* delete an event (admin only)
    },

    // SETTINGS
    SETTINGS: {
        GET_SETTINGS: "/api/settings",  //* get admin settings
        UPDATE_SETTINGS: "/api/settings/update",  //* update admin settings
        GET_USER_PROFILE: "/api/settings/user",  //* get logged-in user profile
        UPDATE_USER_PROFILE: "/api/settings/user/update",  //* update logged-in user profile
    },

    // EXPENSES
    EXPENSES: {
        CREATE: "/api/expenses",  //* create a new expense (admin only)
        GET_ALL: "/api/expenses",  //* get all expenses (admin: all, user: only assigned expenses)
        GET_BY_ID: (id) => `/api/expenses/${id}`,  //* get expense by id
        UPDATE: (id) => `/api/expenses/${id}`,  //* update expense details
        DELETE: (id) => `/api/expenses/${id}`,  //* delete an expense (admin only)
        SUMMARY: "/api/expenses/summary",  //* get high-level summary stats (used by Expenses list header + Analytics)
        BY_CATEGORY: "/api/expenses/by-category",  //* get expenses grouped by category (used by Analytics)
        MONTHLY_TREND: "/api/expenses/monthly-trend",  //* get monthly expense trend (used by Analytics)

        //* User's Own Expenses (My Expenses)
        GET_MY_EXPENSES: "/api/expenses/my",              //* get logged-in user's own expenses
        GET_MY_SUMMARY: "/api/expenses/my/summary",        //* get logged-in user's own stats
        ADD_MY_EXPENSE: "/api/expenses/my",                //* add a personal expense
        UPDATE_MY_EXPENSE: (id) => `/api/expenses/my/${id}`,  //* update own expense
        DELETE_MY_EXPENSE: (id) => `/api/expenses/my/${id}`,  //* delete own expense
    },

    // BUDGETS
    BUDGETS: {
        GET_ALL: "/api/budgets",  //* get all budgets for a given month/year, each with computed spend
        UPSERT: "/api/budgets",  //* create or update a budget for a given category/month/year
        DELETE: (id) => `/api/budgets/${id}`, //* delete a budget by id
    },

    // HOLIDAYS
    HOLIDAYS: {
        APPLY: "/api/holidays",  //* apply for a new holiday (user only)
        GET_MY: "/api/holidays/my",  //* get all holidays of logged-in user (user only)
        UPDATE: (id) => `/api/holidays/${id}`, //* update holiday details (user only)
        DELETE: (id) => `/api/holidays/${id}`,  //* delete a holiday (user only)
        GET_ALL: "/api/holidays",          //* admin — supports ?status=Pending|Approved|Rejected
        REVIEW: (id) => `/api/holidays/${id}/review`, //* admin — approve/reject
    },

    //* PROJECTS
    PROJECTS: {
        GET_DASHBOARD_STATS: "/api/projects/dashboard-stats",  //* role-aware project stats for dashboards
        GET_ALL_PROJECTS: "/api/projects",  //* get all projects (admin: all, user: assigned only) — supports ?status ?priority ?projectLead ?search
        GET_PROJECT_BY_ID: (projectId) => `/api/projects/${projectId}`,  //* get single project details + task stats
        CREATE_PROJECT: "/api/projects",  //* create a new project (admin only)
        UPDATE_PROJECT: (projectId) => `/api/projects/${projectId}`,  //* update project details (admin only)
        DELETE_PROJECT: (projectId) => `/api/projects/${projectId}`,  //* delete a project (admin only)
        ARCHIVE_PROJECT: (projectId) => `/api/projects/${projectId}/archive`,  //* archive a project (admin only)
        UPDATE_PROJECT_STATUS: (projectId) => `/api/projects/${projectId}/status`,  //* change project status (admin only)
        ADD_MEMBER: (projectId) => `/api/projects/${projectId}/members`,  //* add member to project (admin only)
        REMOVE_MEMBER: (projectId, memberId) =>
            `/api/projects/${projectId}/members/${memberId}`,  //* remove member from project (admin only)
        CHANGE_PROJECT_LEAD: (projectId) => `/api/projects/${projectId}/lead`,  //* change project lead (admin only)
        GET_PROJECT_ACTIVITY: (projectId) => `/api/projects/${projectId}/activity`,  //* get project activity timeline
        GET_PROJECT_FILES: (projectId) => `/api/projects/${projectId}/files`,  //* get files linked to a project
    },

    // INSIGHTS (admin only)
    INSIGHTS: {
        GET_ADMIN_INSIGHTS: (range = 30) => `/api/insights/admin?range=${range}`,
        GET_AI_SUMMARY: (range = 30) => `/api/insights/admin/ai-summary?range=${range}`,
    },

    // COLLAB AI
    COLLAB_AI: {
        ASK: "/api/collab-ai/ask",
        HISTORY: "/api/collab-ai/history",
        CLEAR: "/api/collab-ai/clear",
        UPDATE_MESSAGE: (messageId) => `/api/collab-ai/message/${messageId}`,
        DELETE_MESSAGE: (messageId) => `/api/collab-ai/message/${messageId}`,
    },
};