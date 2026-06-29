import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

export const getTimesheets = (params) =>
    axiosInstance.get(API_PATHS.TIMESHEET.GET_ALL, {
        params,
    });

export const getTimesheetStats = () =>
    axiosInstance.get(API_PATHS.TIMESHEET.GET_STATS);

// All employees' approved timesheets — visible to every logged-in user
export const getMyTimesheets = () =>
    axiosInstance.get(API_PATHS.TIMESHEET.GET_MY_TIMESHEETS);

export const createTimesheet = (data) =>
    axiosInstance.post(API_PATHS.TIMESHEET.CREATE, data);

export const approveTimesheet = (id, data = {}) =>
    axiosInstance.put(API_PATHS.TIMESHEET.APPROVE(id), data);

export const rejectTimesheet = (id, data = {}) =>
    axiosInstance.put(API_PATHS.TIMESHEET.REJECT(id), data);

export const deleteTimesheet = (id) =>
    axiosInstance.delete(API_PATHS.TIMESHEET.DELETE(id));

export const getSingleTimesheet = (id) =>
    axiosInstance.get(API_PATHS.TIMESHEET.GET_BY_ID(id));