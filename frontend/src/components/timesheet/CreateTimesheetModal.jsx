import React, { useEffect, useState } from "react";
import {
    X,
    Calendar,
    FolderKanban,
    ClipboardCheck,
    Users,
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
    const [employeeId, setEmployeeId] = useState("");
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

    // EMPLOYEES LIST (for the employee select dropdown)
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    // FIELD-LEVEL ERRORS
    const [errors, setErrors] = useState({});

    const [toast, setToast] = useState("");

    // FETCH EMPLOYEES (only while the modal is open)
    useEffect(() => {
        if (!open) return;

        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);

                const res = await axiosInstance.get(
                    API_PATHS.USERS.GET_ALL_USERS
                );

                setEmployees(res.data || []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, [open]);

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
        setEmployeeId("");
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

        if (!employeeId) {
            newErrors.employeeId = "Please select an employee";
        }

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
            employeeId,
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

    const inputClass = (hasError) =>
        `w-full h-11 px-4 rounded-2xl border focus:outline-none focus:ring-2 text-xs sm:text-sm font-mono transition-all shadow-inner [color-scheme:dark] ${hasError
            ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white"
            : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600"
        }`;

    return (
        <>
            {/* TOAST */}
            {toast && (
                <div className="fixed top-5 inset-x-0 z-[10000] flex justify-center px-4 pointer-events-none animate-[slideDown_.3s_ease]">
                    <div className="pointer-events-auto min-w-[280px] max-w-[420px] w-full px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                        <ClipboardCheck size={22} className="shrink-0" />
                        <p className="text-sm font-mono font-bold leading-tight">
                            {toast}
                        </p>
                    </div>
                </div>
            )}

            {/* RESPONSIVE PLACEMENT FIX: safe margin/padding for mobile viewports */}
            <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-5 pt-8 sm:pt-5 bg-zinc-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">

                {/* MODAL WRAPPER */}
                <div className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] my-auto flex flex-col bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[1.75rem] sm:rounded-[2.25rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] animate-modalPop overflow-hidden">

                    {/* Top Ambient Cyber Glow Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>

                    {/* HEADER */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 shrink-0">

                        <div className="flex items-center gap-3 min-w-0">

                            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                <ClipboardCheck size={20} className="text-cyan-400 sm:w-[20px] sm:h-[20px]" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-mono font-black text-white truncate tracking-wide">
                                    Create Timesheet
                                </h2>

                                <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-0.5 truncate">
                                    Fill today's work details
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 flex items-center justify-center shrink-0 shadow-inner"
                        >
                            <X size={16} className="text-zinc-400 hover:text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-hidden flex flex-col">

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
                            <div className="space-y-4">

                                {/* WORK DETAILS SECTION */}
                                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 sm:p-5 shadow-inner">

                                    <h3 className="text-sm font-mono font-black text-white mb-4 tracking-wide flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                                        Work Details
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* EMPLOYEE */}
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <Users size={14} className="text-cyan-400" />
                                                Employee
                                            </label>

                                            <select
                                                value={employeeId}
                                                onChange={handleFieldChange(setEmployeeId, "employeeId")}
                                                disabled={loadingEmployees}
                                                className={inputClass(errors.employeeId)}
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-400">
                                                    {loadingEmployees ? "Loading employees..." : "Select Employee"}
                                                </option>

                                                {employees.map((emp) => (
                                                    <option key={emp._id} value={emp._id} className="bg-zinc-900 text-white">
                                                        {emp.name} {emp.email ? `(${emp.email})` : ""}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.employeeId && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.employeeId}
                                                </p>
                                            )}
                                        </div>

                                        {/* DATE */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <Calendar size={14} className="text-cyan-400" />
                                                Date
                                            </label>

                                            <input
                                                type="date"
                                                value={date}
                                                onChange={handleFieldChange(setDate, "date")}
                                                className={inputClass(errors.date)}
                                            />

                                            {errors.date && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.date}
                                                </p>
                                            )}
                                        </div>

                                        {/* PROJECT */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <FolderKanban size={14} className="text-purple-400" />
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
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.project}
                                                </p>
                                            )}
                                        </div>

                                        {/* ATTENDANCE */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <ClipboardCheck size={14} className="text-emerald-400" />
                                                Attendance
                                            </label>

                                            <select
                                                value={attendance}
                                                onChange={handleFieldChange(setAttendance, "attendance")}
                                                className={inputClass(errors.attendance)}
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-400">Select Attendance</option>
                                                {ATTENDANCE_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt} className="bg-zinc-900 text-white">
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.attendance && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.attendance}
                                                </p>
                                            )}
                                        </div>

                                        {/* WORK MODE */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <FolderKanban size={14} className="text-amber-400" />
                                                Work Mode
                                            </label>

                                            <select
                                                value={workMode}
                                                onChange={handleFieldChange(setWorkMode, "workMode")}
                                                className={inputClass(errors.workMode)}
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-400">Select Work Mode</option>
                                                {WORK_MODE_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt} className="bg-zinc-900 text-white">
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.workMode && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.workMode}
                                                </p>
                                            )}
                                        </div>

                                        {/* CLOCK IN */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <LogIn size={14} className="text-emerald-400" />
                                                Clock In
                                            </label>

                                            <input
                                                type="time"
                                                value={clockIn}
                                                onChange={handleFieldChange(setClockIn, "clockIn")}
                                                className={inputClass(errors.clockIn)}
                                            />

                                            {errors.clockIn && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.clockIn}
                                                </p>
                                            )}
                                        </div>

                                        {/* CLOCK OUT */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <LogOut size={14} className="text-rose-400" />
                                                Clock Out
                                            </label>

                                            <input
                                                type="time"
                                                value={clockOut}
                                                onChange={handleFieldChange(setClockOut, "clockOut")}
                                                className={inputClass(errors.clockOut)}
                                            />

                                            {errors.clockOut && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.clockOut}
                                                </p>
                                            )}
                                        </div>

                                        {/* BREAK MINUTES */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <Coffee size={14} className="text-orange-400" />
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
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.breakMinutes}
                                                </p>
                                            )}
                                        </div>

                                        {/* OVERTIME HOURS */}
                                        <div>
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <TimerReset size={14} className="text-indigo-400" />
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
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.overtimeHours}
                                                </p>
                                            )}
                                        </div>

                                        {/* NOTES */}
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                                                <StickyNote size={14} className="text-cyan-400" />
                                                Notes
                                            </label>

                                            <textarea
                                                rows={2}
                                                value={notes}
                                                onChange={handleFieldChange(setNotes, "notes")}
                                                placeholder="Describe today's work..."
                                                className={`${inputClass(errors.notes)} h-auto py-2.5 resize-none`}
                                            />

                                            {errors.notes && (
                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                    &gt; {errors.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* DAILY TASKS SECTION */}
                                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 sm:p-5 shadow-inner">

                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <h3 className="text-sm font-mono font-black text-white tracking-wide flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                                            Daily Tasks
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={addTask}
                                            className="cursor-pointer flex items-center gap-1.5 px-3 h-8 bg-zinc-800 border border-white/10 hover:border-cyan-500/30 hover:bg-zinc-800 text-cyan-400 text-[11px] sm:text-xs font-mono font-bold rounded-xl transition-all shadow-inner active:scale-95"
                                        >
                                            <Plus size={14} className="stroke-[3]" />
                                            Add Task
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {tasks.map((task, index) => (
                                            <div
                                                key={index}
                                                className="bg-zinc-950/50 border border-white/5 rounded-2xl p-3 shadow-inner group transition-all hover:border-white/10"
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
                                                            className={inputClass(errors.tasks?.[index]?.title)}
                                                        />

                                                        {errors.tasks?.[index]?.title && (
                                                            <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                                                &gt; {errors.tasks[index].title}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <div className="w-full sm:w-28">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                placeholder="Hours"
                                                                value={task.hours}
                                                                onChange={(e) =>
                                                                    handleTaskChange(index, "hours", e.target.value)
                                                                }
                                                                className={inputClass(errors.tasks?.[index]?.hours)}
                                                            />

                                                            {errors.tasks?.[index]?.hours && (
                                                                <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold whitespace-nowrap">
                                                                    &gt; {errors.tasks[index].hours}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeTask(index)}
                                                            disabled={tasks.length === 1}
                                                            className="cursor-pointer h-11 w-11 shrink-0 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-rose-400 flex items-center justify-center transition-all shadow-inner active:scale-95"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SUBMIT (SERVER) ERROR */}
                                {errors.submit && (
                                    <div className="border border-rose-500/20 bg-rose-500/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-rose-400 shadow-inner">
                                        &gt; {errors.submit}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0 bg-zinc-950/40">

                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer h-10 px-6 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all text-xs sm:text-sm font-mono font-bold text-zinc-300 hover:text-white shadow-inner"
                            >
                                Cancel
                            </button>

                            <div className="relative group cursor-pointer w-full sm:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="relative w-full sm:w-auto cursor-pointer h-10 px-7 rounded-2xl bg-zinc-950 hover:bg-zinc-900 disabled:opacity-70 transition-all duration-300 text-white text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 border border-white/10 shadow-lg active:scale-95"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin text-cyan-400" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardCheck size={15} className="text-cyan-400" />
                                            Create Timesheet
                                        </>
                                    )}
                                </button>
                            </div>
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
                            transform: scale(0.96) translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
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

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .animate-modalPop { animation: modalPop .25s ease; }
                    .animate-fadeIn { animation: fadeIn .2s ease; }

                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 999px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
                    }
                `}
            </style>
        </>
    );
};

export default CreateTimesheetModal;