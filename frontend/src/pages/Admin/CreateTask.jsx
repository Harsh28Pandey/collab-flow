import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PRIORITY_DATA } from "../../utils/data.js";
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { LuTrash, LuArrowLeft, LuChevronDown } from 'react-icons/lu'; // ✅ LuChevronDown import kiya
import SelectDropdown from '../../components/inputs/SelectDropdown.jsx';
import SelectUsers from '../../components/inputs/SelectUsers.jsx';
import TodoListInput from '../../components/inputs/TodoListInput.jsx';
import AddAttachmentsInput from '../../components/inputs/AddAttachmentsInput.jsx';
import Model from '../../components/Model.jsx';
import DeleteAlert from '../../components/DeleteAlert.jsx';

const CreateTask = () => {

    const location = useLocation();
    // ✅ Extract projectId along with taskId from location state
    const { taskId, projectId } = location.state || {};
    const useNavigateInstance = useNavigate();

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        priority: "",
        dueDate: null,
        assignedTo: [],
        todoChecklist: [],
        attachments: [],
        project: projectId || "", // ✅ Default set to project id if coming from ProjectDetails
    });

    const [currentTask, setCurrentTask] = useState(null);
    const [projects, setProjects] = useState([]); // ✅ State for projects dropdown
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const handleValueChange = (key, value) => {
        setTaskData((prevData) => ({ ...prevData, [key]: value }))
    }

    const clearData = () => {
        setTaskData({
            title: "",
            description: "",
            priority: "Low",
            dueDate: null,
            assignedTo: [],
            todoChecklist: [],
            attachments: [],
            project: "", // ✅ Clear project
        })
    }

    // ✅ Fetch all projects for the dropdown
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Safely accessing the API path
                const path = API_PATHS.PROJECTS?.GET_ALL_PROJECTS || API_PATHS.PROJECTS?.GET_ALL || "/api/projects";
                const response = await axiosInstance.get(path);
                setProjects(response.data?.projects || []);
            } catch (error) {
                console.error("Error fetching projects: ", error);
            }
        };
        fetchProjects();
    }, []);

    //* create a task
    const createTask = async () => {
        setLoading(true);

        try {
            const todolist = taskData.todoChecklist?.map((item) => ({
                text: item,
                completed: false
            }));

            const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
                ...taskData,
                dueDate: new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist
            })

            toast.success("Task created successfully");
            clearData();
            useNavigateInstance("/admin/tasks");

        } catch (error) {
            console.error("Error creating task: ", error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    //* update a task
    const updateTask = async () => {
        setLoading(true);

        try {
            const todolist = taskData.todoChecklist?.map((item) => {
                const prevTodoChecklist = currentTask?.todoChecklist || []
                const matchedTask = prevTodoChecklist.find((task) => task.text == item)

                return {
                    text: item,
                    completed: matchedTask ? matchedTask.completed : false
                }
            })

            const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
                ...taskData,
                dueDate: new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist
            })

            toast.success("Task updated successfully");
            useNavigateInstance("/admin/tasks");

        } catch (error) {
            console.error("Error updating task: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        setError(null);

        if (!taskData.title.trim()) {
            setError("Title is required");
            return;
        }

        if (!taskData.description.trim()) {
            setError("Description is required");
            return;
        }

        if (!taskData.dueDate) {
            setError("Due Date is required");
            return;
        }

        if (taskData.assignedTo?.length === 0) {
            setError("Task not assigned to any member");
            return;
        }

        if (taskData.todoChecklist?.length === 0) {
            setError("Add atleast one todo task");
            return;
        }

        if (taskId) {
            updateTask();
            return;
        }

        createTask();
    }

    //* get task by ID
    const getTaskDetailsByID = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId))

            if (response.data) {
                const taskInfo = response.data;
                setCurrentTask(taskInfo);

                setTaskData((prevState) => ({
                    title: taskInfo.title,
                    description: taskInfo.description,
                    priority: taskInfo.priority,
                    dueDate: taskInfo.dueDate
                        ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
                        : null,
                    assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
                    todoChecklist: taskInfo?.todoChecklist?.map((item) => item?.text) || [],
                    attachments: taskInfo?.attachments || [],
                    project: taskInfo?.project?._id || taskInfo?.project || "", // ✅ Pre-fill project if available
                }))
            }
        } catch (error) {
            console.error("Error fetching task details: ", error);
        }
    }

    //* delete a task
    const deleteTask = async () => {
        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId))

            setOpenDeleteAlert(false);
            toast.success("Task deleted successfully");
            useNavigateInstance("/admin/tasks");
        } catch (error) {
            console.error("Error deleting task: ", error.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        if (taskId) {
            getTaskDetailsByID(taskId);
        }
        return () => { }
    }, [taskId])

    return (
        <DashboardLayout activeMenu="Create Task">

            <div className='py-4 md:py-6'>

                <div className='max-w-7xl mx-auto'>

                    {/* ✅ BACK BUTTON ADDED HERE */}
                    <div className="relative group/btn w-fit mb-5 cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-40 group-hover/btn:opacity-100 transition duration-300"></div>
                        <button
                            onClick={() => useNavigateInstance("/admin/tasks")}
                            className="relative flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-white text-xs sm:text-sm font-mono font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-95 shadow-lg"
                        >
                            <LuArrowLeft className="text-sm sm:text-base text-cyan-400 stroke-[3]" />
                            <span>Back to Tasks</span>
                        </button>
                    </div>

                    {/* Header */}

                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6'>

                        <div>
                            <h1 className='text-2xl md:text-3xl font-black text-white tracking-tight'>
                                {taskId ? "Update Task" : "Create Task"}
                            </h1>

                            <p className='text-xs sm:text-sm text-zinc-400 mt-1 font-mono'>
                                {taskId
                                    ? "Update task details, members and progress."
                                    : "Create and assign tasks to your team members."
                                }
                            </p>
                        </div>

                        {taskId && (
                            <button
                                className='w-fit flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-inner'
                                onClick={() => setOpenDeleteAlert(true)}
                            >
                                <LuTrash className='text-base text-rose-400' />
                                Delete Task
                            </button>
                        )}

                    </div>

                    {/* Main Card */}

                    <div className='bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 sm:p-6 md:p-8 relative overflow-hidden'>

                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none"></div>

                        {/* Task Title */}

                        <div>
                            <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-2 block uppercase tracking-wider'>
                                Task Title
                            </label>

                            <input
                                placeholder='Create App UI'
                                className='w-full h-12 md:h-14 px-4 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm md:text-[15px] font-mono text-white placeholder:text-zinc-600 transition-all shadow-inner'
                                value={taskData.title}
                                onChange={({ target }) =>
                                    handleValueChange("title", target.value)
                                }
                            />
                        </div>

                        {/* Description */}

                        <div className='mt-5'>
                            <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-2 block uppercase tracking-wider'>
                                Description
                            </label>

                            <textarea
                                placeholder='Describe the task'
                                rows={5}
                                className='w-full px-4 py-3 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm md:text-[15px] font-mono text-white placeholder:text-zinc-600 transition-all resize-none shadow-inner'
                                value={taskData.description}
                                onChange={({ target }) =>
                                    handleValueChange("description", target.value)
                                }
                            />
                        </div>

                        {/* Grid Fields (Updated to include Project Dropdown with Custom Arrow) */}

                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5'>

                            {/* ✅ Project Dropdown with custom arrow */}
                            <div>
                                <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-2 block uppercase tracking-wider'>
                                    Project
                                </label>
                                <div className="relative">
                                    <select
                                        value={taskData.project}
                                        onChange={(e) => handleValueChange("project", e.target.value)}
                                        className='w-full h-12 pl-4 pr-10 rounded-2xl border border-white/10 bg-zinc-950/80 outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-mono text-white shadow-inner cursor-pointer appearance-none'
                                    >
                                        <option value="" className="bg-zinc-900">None (Standalone Task)</option>
                                        {projects.map((p) => (
                                            <option key={p._id} value={p._id} className="bg-zinc-900">
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <LuChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Priority */}

                            <div>
                                <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-2 block uppercase tracking-wider'>
                                    Priority
                                </label>

                                <SelectDropdown
                                    options={PRIORITY_DATA}
                                    value={taskData.priority}
                                    onChange={(value) =>
                                        handleValueChange("priority", value)
                                    }
                                    placeholder="Select Priority"
                                />
                            </div>

                            {/* Due Date */}

                            <div>
                                <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-2 block uppercase tracking-wider'>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    className='custom-date-input w-full h-12 text-xs sm:text-sm font-mono text-white outline-none bg-zinc-950/80 border border-white/10 px-3.5 rounded-2xl shadow-inner focus:border-cyan-400 transition-all cursor-pointer'
                                    value={taskData.dueDate}
                                    onChange={({ target }) =>
                                        handleValueChange("dueDate", target.value)
                                    }
                                />
                            </div>

                            {/* Assign Users */}

                            <div className='sm:col-span-2 xl:col-span-1'>
                                <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-2 block uppercase tracking-wider'>
                                    Assign To
                                </label>

                                <SelectUsers
                                    selectedUsers={taskData.assignedTo}
                                    setSelectedUsers={(value) => {
                                        handleValueChange("assignedTo", value)
                                    }}
                                />
                            </div>

                        </div>

                        {/* Todo Checklist */}

                        <div className='mt-6'>
                            <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-3 block uppercase tracking-wider'>
                                TODO Checklist
                            </label>

                            <TodoListInput
                                todoList={taskData?.todoChecklist}
                                setTodoList={(value) =>
                                    handleValueChange("todoChecklist", value)
                                }
                            />
                        </div>

                        {/* Attachments */}

                        <div className='mt-6'>
                            <label className='text-xs sm:text-sm font-mono font-bold text-zinc-300 mb-3 block uppercase tracking-wider'>
                                Add Attachments
                            </label>

                            <AddAttachmentsInput
                                attachments={taskData?.attachments}
                                setAttachments={(value) =>
                                    handleValueChange("attachments", value)
                                }
                            />
                        </div>

                        {/* Error */}

                        {error && (
                            <div className='mt-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-mono font-semibold px-4 py-3 rounded-2xl shadow-inner'>
                                &gt; {error}
                            </div>
                        )}

                        {/* Buttons */}

                        <div className='flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-8 pt-6 border-t border-white/5'>

                            <button
                                type='button'
                                onClick={() => useNavigateInstance("/admin/tasks")}
                                className='w-full sm:w-auto h-12 px-6 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer shadow-inner'
                            >
                                Cancel
                            </button>

                            <div className="relative group cursor-pointer w-full sm:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                <button
                                    className='relative w-full sm:w-auto h-12 px-7 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs sm:text-sm font-mono font-bold border border-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-95'
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading
                                        ? taskId
                                            ? "UPDATING..."
                                            : "CREATING..."
                                        : taskId
                                            ? "UPDATE TASK"
                                            : "CREATE TASK"
                                    }
                                </button>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Delete Modal */}

            <Model
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Delete Task"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this task?"
                    onDelete={() => deleteTask()}
                />
            </Model>

        </DashboardLayout>
    )
}

export default CreateTask;