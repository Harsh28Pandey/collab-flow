import React, { useState } from "react";
import {
    X,
    Calendar,
    FolderKanban,
    ClipboardCheck,
    LogIn,
    LogOut,
    Coffee,
    TimerReset,
    StickyNote,
    Plus,
    Trash2,
    Loader2,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ATTENDANCE_OPTIONS = ["Present", "Absent", "Half Day", "Leave"];
const WORK_MODE_OPTIONS = ["Office", "WFH", "Hybrid"];

const CreateTimesheetModal = ({ open, onClose, onSuccess }) => {

    const today = new Date().toISOString().split("T")[0];

    // FORM FIELDS
    const [date, setDate] = useState(today);
    const [project, setProject] = useState("");
    const [attendance, setAttendance] = useState("");
    const [workMode, setWorkMode] = useState("");
    const [clockIn, setClockIn] = useState("");
    const [clockOut, setClockOut] = useState("");
    const [breakMinutes, setBreakMinutes] = useState("");
    const [overtimeHours, setOvertimeHours] = useState("");
    const [notes, setNotes] = useState("");

    const [tasks, setTasks] = useState([{ title: "", hours: "" }]);

    const [creating, setCreating] = useState(false);

    // FIELD-LEVEL ERRORS
    // Shape: { date, project, attendance, workMode, clockIn, clockOut,
    //          breakMinutes, overtimeHours, notes, tasks: { [index]: { title, hours } } }
    const [errors, setErrors] = useState({});

    const [toast, setToast] = useState("");

    // TASKS
    const handleTaskChange = (index, field, value) => {
        const updated = [...tasks];
        updated[index][field] = value;
        setTasks(updated);

        // Clear that specific task field's error as the user types
        setErrors((prev) => {
            if (!prev.tasks?.[index]?.[field]) return prev;

            const updatedTaskErrors = { ...prev.tasks };
            updatedTaskErrors[index] = {
                ...updatedTaskErrors[index],
                [field]: "",
            };

            return { ...prev, tasks: updatedTaskErrors };
        });
    };

    const addTask = () => {
        setTasks((prev) => [...prev, { title: "", hours: "" }]);
    };

    const removeTask = (index) => {
        if (tasks.length === 1) return;

        setTasks((prev) => prev.filter((_, i) => i !== index));

        // Re-index task errors after removal
        setErrors((prev) => {
            if (!prev.tasks) return prev;

            const updatedTaskErrors = {};
            Object.keys(prev.tasks)
                .map(Number)
                .filter((i) => i !== index)
                .forEach((i) => {
                    const newIndex = i > index ? i - 1 : i;
                    updatedTaskErrors[newIndex] = prev.tasks[i];
                });

            return { ...prev, tasks: updatedTaskErrors };
        });
    };

    // GENERIC FIELD CHANGE HELPER (clears that field's error on change)
    const handleFieldChange = (setter, field) => (e) => {
        setter(e.target.value);
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // RESET
    const resetForm = () => {
        setDate(today);
        setProject("");
        setAttendance("");
        setWorkMode("");
        setClockIn("");
        setClockOut("");
        setBreakMinutes("");
        setOvertimeHours("");
        setNotes("");
        setTasks([{ title: "", hours: "" }]);
        setErrors({});
    };

    // VALIDATION
    const validateForm = () => {
        const newErrors = {};

        if (!date) {
            newErrors.date = "Date is required";
        }

        if (!project.trim()) {
            newErrors.project = "Project name is required";
        }

        if (!attendance) {
            newErrors.attendance = "Attendance is required";
        }

        if (!workMode) {
            newErrors.workMode = "Work mode is required";
        }

        if (!clockIn) {
            newErrors.clockIn = "Clock in is required";
        }

        if (!clockOut) {
            newErrors.clockOut = "Clock out is required";
        }

        if (breakMinutes === "" || breakMinutes === null) {
            newErrors.breakMinutes = "Break minutes is required";
        }

        if (overtimeHours === "" || overtimeHours === null) {
            newErrors.overtimeHours = "Overtime hours is required";
        }

        if (!notes.trim()) {
            newErrors.notes = "Notes is required";
        }

        const taskErrors = {};

        tasks.forEach((task, index) => {
            const taskErr = {};

            if (!task.title.trim()) {
                taskErr.title = "Task title is required";
            }

            if (task.hours === "" || task.hours === null) {
                taskErr.hours = "Hours is required";
            }

            if (Object.keys(taskErr).length > 0) {
                taskErrors[index] = taskErr;
            }
        });

        if (Object.keys(taskErrors).length > 0) {
            newErrors.tasks = taskErrors;
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        const formData = {
            date,
            project,
            attendanceStatus: attendance,
            workMode,
            clockIn,
            clockOut,
            breakMinutes,
            overtimeHours,
            notes,
            tasks,
        };

        try {
            setCreating(true);

            await axiosInstance.post(
                API_PATHS.TIMESHEET.CREATE,
                formData
            );

            setToast("Timesheet created successfully");

            setTimeout(() => {
                setToast("");
                onSuccess?.();
                onClose();
                resetForm();
            }, 1500);

        } catch (err) {
            console.log(err);

            // Surface backend field-level errors (if any) onto the form
            const backendErrors = err?.response?.data?.errors;

            if (backendErrors) {
                setErrors((prev) => ({ ...prev, ...backendErrors }));
            }

            setErrors((prev) => ({
                ...prev,
                submit:
                    err?.response?.data?.message ||
                    "Failed to create timesheet",
            }));
        } finally {
            setCreating(false);
        }
    };

    if (!open) return null;

    // Shared input style helper — adds red ring when that field has an error
    const inputClass = (hasError) =>
        `w-full h-11 px-4 rounded-2xl border focus:outline-none focus:ring-2 text-sm ${hasError
            ? "border-red-300 focus:ring-red-400"
            : "border-gray-200 focus:ring-blue-500"
        }`;

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
                    <div className="w-full max-w-2xl bg-white rounded-[26px] shadow-2xl overflow-hidden animate-[modalPop_.25s_ease]">

                        {/* HEADER */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

                            <div className="flex items-center gap-3">

                                <div className="h-11 w-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <ClipboardCheck size={22} className="text-blue-600" />
                                </div>

                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        Create Timesheet
                                    </h2>

                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Fill today's work details
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer h-10 w-10 rounded-2xl hover:bg-gray-100 transition flex items-center justify-center"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            {/* BODY */}
                            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">

                                {/* WORK DETAILS */}
                                <div className="border border-gray-200 rounded-3xl p-4">

                                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                                        Work Details
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* DATE */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Calendar size={16} />
                                                Date
                                            </label>

                                            <input
                                                type="date"
                                                value={date}
                                                onChange={handleFieldChange(setDate, "date")}
                                                className={inputClass(errors.date)}
                                            />

                                            {errors.date && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.date}
                                                </p>
                                            )}
                                        </div>

                                        {/* PROJECT */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <FolderKanban size={16} />
                                                Project Name
                                            </label>

                                            <input
                                                type="text"
                                                value={project}
                                                onChange={handleFieldChange(setProject, "project")}
                                                placeholder="Enter project name"
                                                className={inputClass(errors.project)}
                                            />

                                            {errors.project && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.project}
                                                </p>
                                            )}
                                        </div>

                                        {/* ATTENDANCE */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <ClipboardCheck size={16} />
                                                Attendance
                                            </label>

                                            <select
                                                value={attendance}
                                                onChange={handleFieldChange(setAttendance, "attendance")}
                                                className={`${inputClass(errors.attendance)} bg-white`}
                                            >
                                                <option value="">Select Attendance</option>

                                                {ATTENDANCE_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.attendance && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.attendance}
                                                </p>
                                            )}
                                        </div>

                                        {/* WORK MODE */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <FolderKanban size={16} />
                                                Work Mode
                                            </label>

                                            <select
                                                value={workMode}
                                                onChange={handleFieldChange(setWorkMode, "workMode")}
                                                className={`${inputClass(errors.workMode)} bg-white`}
                                            >
                                                <option value="">Select Work Mode</option>

                                                {WORK_MODE_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.workMode && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.workMode}
                                                </p>
                                            )}
                                        </div>

                                        {/* CLOCK IN */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <LogIn size={16} />
                                                Clock In
                                            </label>

                                            <input
                                                type="time"
                                                value={clockIn}
                                                onChange={handleFieldChange(setClockIn, "clockIn")}
                                                className={inputClass(errors.clockIn)}
                                            />

                                            {errors.clockIn && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.clockIn}
                                                </p>
                                            )}
                                        </div>

                                        {/* CLOCK OUT */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <LogOut size={16} />
                                                Clock Out
                                            </label>

                                            <input
                                                type="time"
                                                value={clockOut}
                                                onChange={handleFieldChange(setClockOut, "clockOut")}
                                                className={inputClass(errors.clockOut)}
                                            />

                                            {errors.clockOut && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.clockOut}
                                                </p>
                                            )}
                                        </div>

                                        {/* BREAK MINUTES */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Coffee size={16} />
                                                Break (minutes)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="e.g. 30"
                                                value={breakMinutes}
                                                onChange={handleFieldChange(setBreakMinutes, "breakMinutes")}
                                                className={inputClass(errors.breakMinutes)}
                                            />

                                            {errors.breakMinutes && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.breakMinutes}
                                                </p>
                                            )}
                                        </div>

                                        {/* OVERTIME HOURS */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <TimerReset size={16} />
                                                Overtime (hours)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                placeholder="e.g. 1.5"
                                                value={overtimeHours}
                                                onChange={handleFieldChange(setOvertimeHours, "overtimeHours")}
                                                className={inputClass(errors.overtimeHours)}
                                            />

                                            {errors.overtimeHours && (
                                                <p className="text-xs text-red-600 mt-1.5">
                                                    {errors.overtimeHours}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* NOTES */}
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                            <StickyNote size={16} />
                                            Notes
                                        </label>

                                        <textarea
                                            rows={3}
                                            value={notes}
                                            onChange={handleFieldChange(setNotes, "notes")}
                                            placeholder="Describe today's work..."
                                            className={`${inputClass(errors.notes)} h-auto py-3 resize-none`}
                                        />

                                        {errors.notes && (
                                            <p className="text-xs text-red-600 mt-1.5">
                                                {errors.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* DAILY TASKS */}
                                <div className="border border-gray-200 rounded-3xl p-4">

                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <ClipboardCheck size={18} />
                                            Daily Tasks
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={addTask}
                                            className="cursor-pointer flex items-center gap-1.5 px-3.5 h-9 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-blue-700 transition-all"
                                        >
                                            <Plus size={15} />
                                            Add Task
                                        </button>
                                    </div>

                                    <div className="space-y-3">

                                        {tasks.map((task, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 rounded-2xl p-3"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Task title"
                                                            value={task.title}
                                                            onChange={(e) =>
                                                                handleTaskChange(index, "title", e.target.value)
                                                            }
                                                            className={`w-full h-10 px-3 rounded-xl border focus:outline-none focus:ring-2 text-sm ${errors.tasks?.[index]?.title
                                                                    ? "border-red-300 focus:ring-red-400"
                                                                    : "border-gray-200 focus:ring-blue-500"
                                                                }`}
                                                        />

                                                        {errors.tasks?.[index]?.title && (
                                                            <p className="text-xs text-red-600 mt-1.5">
                                                                {errors.tasks[index].title}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <div className="w-full sm:w-24">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                placeholder="Hours"
                                                                value={task.hours}
                                                                onChange={(e) =>
                                                                    handleTaskChange(index, "hours", e.target.value)
                                                                }
                                                                className={`w-full h-10 px-3 rounded-xl border focus:outline-none focus:ring-2 text-sm ${errors.tasks?.[index]?.hours
                                                                        ? "border-red-300 focus:ring-red-400"
                                                                        : "border-gray-200 focus:ring-blue-500"
                                                                    }`}
                                                            />

                                                            {errors.tasks?.[index]?.hours && (
                                                                <p className="text-xs text-red-600 mt-1.5 whitespace-nowrap">
                                                                    {errors.tasks[index].hours}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeTask(index)}
                                                            disabled={tasks.length === 1}
                                                            className="cursor-pointer h-10 w-10 shrink-0 rounded-xl hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-500 flex items-center justify-center transition"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT (SERVER) ERROR */}
                            {errors.submit && (
                                <div className="px-5 pb-3">
                                    <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-3 text-sm text-red-600">
                                        {errors.submit}
                                    </div>
                                </div>
                            )}

                            {/* FOOTER */}
                            <div className="border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={17} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardCheck size={17} />
                                            Create Timesheet
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
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

export default CreateTimesheetModal;