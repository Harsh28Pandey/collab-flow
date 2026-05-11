// export const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",  //* register a new user (admin or member)
        LOGIN: "/api/auth/login",  //* authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile",  //* get logged-in user details
    },

    USERS: {
        GET_ALL_USERS: "/api/users",  //* get all users (admin only)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`,  //* get user by id
        CREATE_USER: "/api/users",  //* create a new user (admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`,  //* update user details
        DELETE_USER: (userId) => `/api/users/${userId}`,  //* delete a user
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data",  //* get dashboard data
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",  //* get user dashboard data
        GET_ALL_TASKS: "/api/tasks",  //* get all tasks (admin: all, user: only assigned tasks)
        GET_TASK_BY_ID: (userId) => `/api/tasks/${userId}`,  //* get task by id
        CREATE_TASK: "/api/tasks",  //* create a new task (admin only)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,  //* update task details
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,  //* delete a task (admin only)
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
        CREATE_GROUP: "/api/groups",  //* create a group (admin only)
        GET_MY_GROUPS: "/api/groups",  //* get my groups where admin and members should be added
        ADD_MEMBER: "/api/groups/add",  //* add member into a particular group (admin only)
        REMOVE_MEMBER: "/api/groups/remove",  //* remove member from particular group (admin only)
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

        // GET_POLL_BY_ID: (pollId) => `/api/polls/${pollId}`,  //* optional (future use)
    },
};