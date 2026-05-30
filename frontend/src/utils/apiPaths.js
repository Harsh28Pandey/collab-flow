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

    // SETTINGS
    SETTINGS: {
        GET_SETTINGS: "/api/settings",  //* get admin settings
        UPDATE_SETTINGS: "/api/settings/update",  //* update admin settings
        GET_USER_PROFILE: "/api/settings/user",  //* get logged-in user profile
        UPDATE_USER_PROFILE: "/api/settings/user/update",  //* update logged-in user profile
    },
};